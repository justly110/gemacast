#!/usr/bin/env bash
#
# 一次性向导：为 `.github/workflows/build-apk.yml` 固定安卓签名。
# 生成（或复用）release keystore，把 4 个 secret 与 1 个指纹变量写入仓库，
# 使每次 CI 构建的 APK 都由同一张证书签名 —— 升级才能直接覆盖安装。
#
# 用法：bash .github/scripts/setup-android-signing.sh
# 需要：git bash + JDK 17 以上（keytool）+ 已 gh auth login 的本机。
# 幂等：重复运行会复用 $HOME/.gemacast/gemacast-release.p12，不会重新生成密钥。
#
# Everything above the "STAGES" marker is the wizard library: do not hand-edit
# it. Author the per-step stages below the marker.

set -euo pipefail

# ──────────────────────────────────────────────────────────────────────────
# Wizard library: delightful, consistent UX, identical across every wizard.
# ──────────────────────────────────────────────────────────────────────────

if [[ -t 1 ]] && command -v tput >/dev/null 2>&1 && [[ "$(tput colors 2>/dev/null || echo 0)" -ge 8 ]]; then
  BOLD=$(tput bold); DIM=$(tput dim); RESET=$(tput sgr0)
  BLUE=$(tput setaf 4); GREEN=$(tput setaf 2); YELLOW=$(tput setaf 3)
else
  BOLD=""; DIM=""; RESET=""; BLUE=""; GREEN=""; YELLOW=""
fi

# Author sets this at the top of the stages section.
TOTAL_STAGES=0

_STAGE_INDEX=0
ENV_FILE="${ENV_FILE:-.env}"
WRITTEN_ENV=()    # KEYs written to ENV_FILE this run
WRITTEN_SECRET=() # secret NAMEs set this run
SKIPPED=()        # things we couldn't do (e.g. gh missing)

# _clear wipes the terminal so only the current step is on screen. No-op when
# output isn't a terminal, so piped logs stay readable.
_clear() {
  [[ -t 1 ]] || return 0
  if command -v tput >/dev/null 2>&1 && tput clear 2>/dev/null; then return 0; fi
  printf '\033[2J\033[3J\033[H'
}

# banner "Title" shows the opening frame: what this wizard does.
banner() {
  _clear
  printf '\n%s%s  %s%s\n' "$BOLD" "$BLUE" "$1" "$RESET"
  printf '%s  %s stages%s\n\n' "$DIM" "$TOTAL_STAGES" "$RESET"
  printf '%s  You drive the browser; this wizard tells you exactly what to do and\n' "$DIM"
  printf '  captures the values you copy back. Stop any time with Ctrl-C and re-run\n'
  printf '  later, since it remembers values already saved.%s\n' "$RESET"
  pause "Ready to start?"
}

# stage "Name" clears the screen, then announces a stage and shows progress.
# Clearing keeps only the current step on screen.
stage() {
  _clear
  _STAGE_INDEX=$((_STAGE_INDEX + 1))
  printf '\n%s%s▸ Stage %s/%s · %s%s\n' \
    "$BOLD" "$BLUE" "$_STAGE_INDEX" "$TOTAL_STAGES" "$1" "$RESET"
}

# say "..." prints a plain instruction line.
say()  { printf '  %s\n' "$1"; }
# step "..." is a numbered-feeling action the human takes in the browser.
step() { printf '  %s•%s %s\n' "$BLUE" "$RESET" "$1"; }
note() { printf '  %s%s%s\n' "$DIM" "$1" "$RESET"; }
warn() { printf '  %s⚠ %s%s\n' "$YELLOW" "$1" "$RESET"; }

# open_url URL opens it in the human's browser, cross-platform incl. WSL.
open_url() {
  local url="$1"
  printf '  %s↗ opening%s %s\n' "$GREEN" "$RESET" "$url"
  { if   command -v wslview     >/dev/null 2>&1; then wslview "$url"
    elif command -v explorer.exe >/dev/null 2>&1; then explorer.exe "$url"
    elif command -v xdg-open    >/dev/null 2>&1; then xdg-open "$url"
    elif command -v open        >/dev/null 2>&1; then open "$url"
    else false; fi
  } >/dev/null 2>&1 || warn "couldn't open a browser, so visit it manually: $url"
}

# pause "msg" waits for the human to confirm they've done the manual part.
pause() {
  printf '  %s%s%s ' "$DIM" "${1:-Press Enter to continue}" "$RESET"
  read -r _ || true
}

# confirm "question" is a y/N gate; returns success on yes.
confirm() {
  local reply=""
  printf '  %s? %s [y/N] ' "$YELLOW" "$1"
  read -r reply || true
  [[ "$reply" =~ ^[Yy] ]]
}

# _existing KEY: current value of KEY in ENV_FILE, if any, with write_env's single
# quotes or a plain dotenv double-quoted value undone.
_existing() {
  [[ -f "$ENV_FILE" ]] || return 1
  local line value sq="'\\''"; line=$(grep -E "^${1}=" "$ENV_FILE" | tail -n1) || return 1
  value="${line#*=}"
  if [[ "$value" == \'*\' ]]; then value="${value:1:${#value}-2}"; value="${value//"$sq"/\'}"
  elif [[ "$value" == \"*\" ]]; then
    value="${value:1:${#value}-2}"
    [[ "$value" == *[\\\$\"]* ]] && return 1   # escapes, $ or ": can't decode safely; ask again
  fi
  printf '%s' "$value"
}

# ask KEY "Prompt" reads a value into $KEY. Offers the existing .env value as
# a default on re-runs (Enter keeps it). Visible input (non-secret), edited
# with Readline. Fails at EOF with no input.
ask() {
  local key="$1" prompt="$2" current input s=$'\001' e=$'\002' p rc=0
  current=$(_existing "$key" || true)
  # Readline needs the colour codes wrapped in \001..\002 to place the cursor.
  p="  $s$BOLD$e$prompt$s$RESET$e "
  [[ -n "$current" ]] && p+="$s$DIM$e[Enter keeps current]$s$RESET$e "
  read -e -r -p "$p" input || rc=1
  if (( rc )) && [[ -z "$input" ]]; then return 1; fi
  [[ -z "$input" && -n "$current" ]] && input="$current"
  printf -v "$key" '%s' "$input"
}

# ask_secret KEY "Prompt" is like ask, but input is hidden.
ask_secret() {
  local key="$1" prompt="$2" current input rc=0
  current=$(_existing "$key" || true)
  if [[ -n "$current" ]]; then
    printf '  %s%s%s %s[Enter keeps current]%s ' "$BOLD" "$prompt" "$RESET" "$DIM" "$RESET"
  else
    printf '  %s%s%s ' "$BOLD" "$prompt" "$RESET"
  fi
  read -rs input || rc=1
  printf '\n'
  if (( rc )) && [[ -z "$input" ]]; then return 1; fi
  [[ -z "$input" && -n "$current" ]] && input="$current"
  printf -v "$key" '%s' "$input"
}

# write_env KEY VALUE upserts KEY='VALUE' into ENV_FILE (replaces any existing
# line) and sets $KEY. Idempotent. Creates ENV_FILE at mode 0600; writes through
# a symlink and keeps an existing file's mode.
write_env() {
  local key="$1" value="$2" tmp sq="'\\''"
  [[ -e "$ENV_FILE" ]] || (umask 077 && : > "$ENV_FILE")
  tmp=$(mktemp)
  grep -vE "^${key}=" "$ENV_FILE" > "$tmp" || true
  printf "%s='%s'\n" "$key" "${value//\'/$sq}" >> "$tmp"
  cat "$tmp" > "$ENV_FILE"
  rm -f "$tmp"
  printf -v "$key" '%s' "$value"
  WRITTEN_ENV+=("$key")
  printf '  %s✓ wrote%s %s → %s\n' "$GREEN" "$RESET" "$key" "$ENV_FILE"
}

# set_secret NAME VALUE sets a GitHub Actions repo secret via gh. Falls back
# to a warning (and records it) if gh is unavailable or unauthenticated.
set_secret() {
  local name="$1" value="$2"
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    if printf '%s' "$value" | gh secret set "$name" >/dev/null 2>&1; then
      WRITTEN_SECRET+=("$name")
      printf '  %s✓ set%s GitHub secret %s\n' "$GREEN" "$RESET" "$name"
      return
    fi
  fi
  SKIPPED+=("GitHub secret $name (set it manually: gh secret set $name)")
  warn "skipped GitHub secret $name: gh not ready; set it later"
}

# set_var NAME VALUE sets a GitHub Actions repo variable (non-secret).
set_var() {
  local name="$1" value="$2"
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    if gh variable set "$name" --body "$value" >/dev/null 2>&1; then
      printf '  %s✓ set%s GitHub variable %s\n' "$GREEN" "$RESET" "$name"
      return
    fi
  fi
  SKIPPED+=("GitHub variable $name")
  warn "skipped GitHub variable $name, gh not ready; set it later"
}

# finish clears, then shows a closing summary of everything configured.
finish() {
  _clear
  printf '\n%s%s  ✓ Setup complete%s\n' "$BOLD" "$GREEN" "$RESET"
  (( ${#WRITTEN_ENV[@]} ))    && note "wrote ${#WRITTEN_ENV[@]} value(s) to $ENV_FILE: ${WRITTEN_ENV[*]}"
  (( ${#WRITTEN_SECRET[@]} )) && note "set ${#WRITTEN_SECRET[@]} GitHub secret(s): ${WRITTEN_SECRET[*]}"
  if (( ${#SKIPPED[@]} )); then
    printf '\n'; warn "still to do by hand:"
    for s in "${SKIPPED[@]}"; do note "  - $s"; done
  fi
  printf '\n'
}

# ──────────────────────────────────────────────────────────────────────────
# STAGES: author this section. One stage() per step the human takes.
# Replace the example below. Set TOTAL_STAGES to match the stages you write.
# Keep every stage inside run_wizard and the last line as is: bash then parses
# the whole file before the first prompt, so an edit mid-run can't break it.
# ──────────────────────────────────────────────────────────────────────────

# _keytool 打印可用的 keytool 可执行文件路径（Windows 上是 .exe）。
_keytool() {
  local kt
  if kt=$(command -v keytool 2>/dev/null); then printf '%s' "$kt"; return 0; fi
  if [[ -n "${JAVA_HOME:-}" && -x "${JAVA_HOME}/bin/keytool" ]]; then
    printf '%s' "${JAVA_HOME}/bin/keytool"; return 0
  fi
  for kt in "/c/Program Files/Java"/*/bin/keytool.exe /usr/lib/jvm/*/bin/keytool; do
    [[ -x "$kt" ]] && { printf '%s' "$kt"; return 0; }
  done
  return 1
}

# _winpath POSIX路径 -> 传给 JDK 原生程序所需的 Windows 路径。
_winpath() { cygpath -w "$1" 2>/dev/null || printf '%s' "$1"; }

run_wizard() {

TOTAL_STAGES=4

KS_PATH="$HOME/.gemacast/gemacast-release.p12"

banner "固定安卓签名（Gemacast）"

say "Android 只允许同一包名、同一证书的新版本覆盖安装。"
say "CI 若没有稳定的 keystore，就会每次临时生成一把新密钥，"
say "结果是每次升级都要求先卸载旧版本（并丢掉配对与设置）。"
note ""
note "本向导做四件事：生成/复用 release keystore → 写入 4 个 secret →"
note "钉死证书指纹 → 提醒备份。口令只留在内存和 GitHub Secrets 里，不落盘。"

# ── Stage 1: 口令与别名 ────────────────────────────────────────────────────
stage "口令与证书别名"
if [[ -e "$KS_PATH" ]]; then
  say "已存在 keystore：$KS_PATH"
  say "输入它的口令以解锁（复用，不重新生成）。"
else
  say "将新建 keystore：$KS_PATH"
  say "口令同时用作 keystore 口令与私钥口令（PKCS#12 要求一致）。"
fi
note "至少 6 个字符。请立刻存进密码管理器 —— 丢了就只能让用户卸载重装。"
ask_secret KS_PASS "release 签名口令："
if (( ${#KS_PASS} < 6 )); then
  warn "口令至少 6 个字符。"
  exit 1
fi
if [[ ! -e "$KS_PATH" ]]; then
  ask_secret KS_PASS2 "再输入一次确认："
  if [[ "$KS_PASS" != "$KS_PASS2" ]]; then
    warn "两次输入不一致，请重跑本向导。"
    exit 1
  fi
fi
ask KEY_ALIAS "证书别名 [Enter = gemacast]："
KEY_ALIAS="${KEY_ALIAS:-gemacast}"

# ── Stage 2: 生成或复用 keystore ──────────────────────────────────────────
stage "生成或复用 release keystore"
KT=$(_keytool) || { warn "找不到 keytool：请安装 JDK 17 以上，或设置 JAVA_HOME。"; exit 1; }
KS_WIN=$(_winpath "$KS_PATH")
mkdir -p "$(dirname "$KS_PATH")"

if [[ -e "$KS_PATH" ]]; then
  if ! printf '%s\n' "$KS_PASS" | "$KT" -list -keystore "$KS_WIN" -alias "$KEY_ALIAS" >/dev/null 2>&1; then
    warn "口令无法解锁 $KS_PATH，或别名 $KEY_ALIAS 不存在。"
    say "别名不对就先删掉该 keystore 再重跑（会生成新密钥，届时用户需卸载一次）。"
    exit 1
  fi
  say "已复用现有 keystore（密钥未变）。"
else
  # 口令经 stdin 进入 keytool，不进 argv，也不进环境变量或临时文件。
  if ! printf '%s\n%s\n' "$KS_PASS" "$KS_PASS" | "$KT" -genkeypair -v \
      -keystore "$KS_WIN" -storetype PKCS12 -alias "$KEY_ALIAS" \
      -keyalg RSA -keysize 2048 -sigalg SHA256withRSA -validity 10000 \
      -dname "CN=Gemacast Release, O=justly110, C=CN" >/dev/null 2>&1; then
    warn "keytool 生成 keystore 失败。"
    exit 1
  fi
  say "已生成：$KS_PATH（RSA 2048 / SHA256withRSA / 10000 天）"
fi

FPRINT=$(printf '%s\n' "$KS_PASS" | "$KT" -list -v -keystore "$KS_WIN" -alias "$KEY_ALIAS" 2>/dev/null \
  | grep -m1 -oE '([0-9A-F]{2}:){31}[0-9A-F]{2}')
if [[ -z "$FPRINT" ]]; then
  warn "读取证书指纹失败。"
  exit 1
fi
CERT_SHA256=$(printf '%s' "$FPRINT" | tr -d ':' | tr 'A-F' 'a-f')
say "证书 SHA-256（公开信息，可任意传播）："
note "  $FPRINT"

# ── Stage 3: 写入 GitHub Actions secrets ─────────────────────────────────
stage "写入 GitHub Actions secrets"
if ! command -v gh >/dev/null 2>&1 || ! gh auth status >/dev/null 2>&1; then
  warn "gh 未安装或未登录，无法自动写入。"
  say "手动执行以下四条（第一条会提示粘贴 keystore 的 base64）："
  note "  base64 -w0 \"$KS_PATH\" | gh secret set ANDROID_KEYSTORE_BASE64"
  note "  gh secret set ANDROID_KEYSTORE_PASSWORD"
  note "  gh secret set ANDROID_KEY_ALIAS"
  note "  gh secret set ANDROID_KEY_PASSWORD"
  SKIPPED+=("4 个 GitHub secret：gh 未登录")
  exit 1
fi
note "keystore 以 base64 直接经管道写入 gh，不落盘、不回显。"
if base64 -w0 "$KS_PATH" | gh secret set ANDROID_KEYSTORE_BASE64 >/dev/null 2>&1; then
  WRITTEN_SECRET+=("ANDROID_KEYSTORE_BASE64")
  printf '  %s✓ set%s GitHub secret ANDROID_KEYSTORE_BASE64\n' "$GREEN" "$RESET"
else
  warn "写入 ANDROID_KEYSTORE_BASE64 失败。"
  exit 1
fi
set_secret ANDROID_KEYSTORE_PASSWORD "$KS_PASS"
set_secret ANDROID_KEY_ALIAS "$KEY_ALIAS"
set_secret ANDROID_KEY_PASSWORD "$KS_PASS"

# ── Stage 4: 钉死指纹、核对、备份 ─────────────────────────────────────────
stage "钉死证书指纹并核对"
say "把指纹写进仓库变量 ANDROID_CERT_SHA256。"
say "构建时签名证书对不上就直接失败，而不是悄悄发出一个装不上的 APK。"
set_var ANDROID_CERT_SHA256 "$CERT_SHA256"

say ""
say "当前仓库的 secrets（只显示名称）："
gh secret list 2>/dev/null | grep -E '^ANDROID_(KEYSTORE|KEY_|CERT)' || note "  （读取失败，稍后可在网页 Settings → Secrets 里确认）"

say ""
warn "备份：$KS_PATH 与签名口令必须长期保存。"
say "丢失 keystore 或口令 = 永久失去升级能力，只能让所有用户卸载重装。"
note "不要把它提交进仓库（.gitignore 已忽略 *.p12 / *.keystore / *.jks）。"

finish
}

run_wizard "$@"; exit

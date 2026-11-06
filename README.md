# Gemacast

[![Release](https://img.shields.io/github/v/release/justly110/gemacast?label=release)](https://github.com/justly110/gemacast/releases/latest)
[![Rust](https://img.shields.io/badge/rust-1.97.1-orange)](https://www.rust-lang.org/)
[![TypeScript](https://img.shields.io/badge/typescript-6-blue)](https://www.typescriptlang.org/)
[![Release Date](https://img.shields.io/github/release-date/justly110/gemacast)](https://github.com/justly110/gemacast/releases/latest)
[![Last Commit](https://img.shields.io/github/last-commit/justly110/gemacast)](https://github.com/justly110/gemacast/commits/main)
[![Downloads](https://img.shields.io/github/downloads/justly110/gemacast/total)](https://github.com/justly110/gemacast/releases)
[![License](https://img.shields.io/github/license/justly110/gemacast)](LICENSE)

通过 Wi-Fi、USB 网络共享或 ADB，将电脑上的桌面音频串流到安卓手机。
既可以捕获整个系统的声音，也可以只捕获某个应用的音频，并同时播放到一台或多台手机上。把你的手机变成一个音箱！

## 目录

- [环境要求与安装](#环境要求与安装)
- [功能特性](#功能特性)
- [防火墙](#防火墙)
- [音频格式](#音频格式)
- [从源码编译](#从源码编译)
- [常见问题](#常见问题)
- [许可证](#许可证)
- [第三方库致谢](#第三方库致谢)

## 环境要求与安装

### Windows

最低要求：Windows 10 版本 2004 或更高。

1. 从 [Releases](https://github.com/justly110/gemacast/releases/latest) 下载 `.msi` 安装包或 `.zip` 压缩包。
2. 运行安装程序。它会自动创建 Windows 防火墙规则，放行 UDP 23555-23556 与 TCP 23559 端口。
3. 从开始菜单或系统托盘启动 Gemacast。

### Linux

需要 PipeWire 0.3+ 会话以及 WirePlumber 才能进行音频捕获。

从 [Releases](https://github.com/justly110/gemacast/releases/latest) 下载 `.deb`、`.rpm`、`.AppImage` 或 `.tar.xz`。

```bash
# Debian / Ubuntu (.deb)
sudo dpkg -i gemacast-pc_*.deb

# Fedora / RHEL (.rpm)
sudo rpm -i gemacast-pc-*.rpm
```

`.deb` 与 `.rpm` 包会自动安装所需的界面库（GTK3、AppIndicator），并配置防火墙规则与端口预留。

使用 `.AppImage` 或 `.tar.xz` 时，需要手动开放端口（参见 [防火墙](#防火墙)）。此外，`.tar.xz` 中的可执行文件需要系统已安装 GTK3 与 AppIndicator（例如 `libayatana-appindicator3-1`）才能显示系统托盘图标。

### macOS

需要 macOS >= 13。

从 [Releases](https://github.com/justly110/gemacast/releases/latest) 下载 `.dmg`。

该二进制未签名、也未公证。首次启动时请右键点击应用并选择“打开”，或执行：

```bash
xattr -d com.apple.quarantine /Applications/Gemacast.app
```

在 macOS 13 及更高版本上，音频捕获使用 ScreenCaptureKit（需要“屏幕录制”权限）。
在 macOS 12 及更低版本上会回退到 CPAL，此时需要一个虚拟输出设备（BlackHole 或 Soundflower）。

### Android

最低要求：Android 8.0（Oreo，API 26）或更高。

从 [Releases](https://github.com/justly110/gemacast/releases/latest) 下载 `.apk` 并安装。
大多数手机应使用体积更小的 ARM64 版本 `gemacast-mobile.apk`；只有在需要多架构版本时才使用
`gemacast-mobile-universal.apk`。
手机与电脑必须处于同一网络、通过 USB 网络共享连接，或用 ADB 数据线连接并通过 `adb reverse` 转发。

## 功能特性

| 功能 | 说明 |
|---|---|
| 音频捕获 | 捕获整个桌面音频，或仅捕获单个应用的音频 |
| 编码格式 | Opus LowDelay/CELT，10-512 kbps；或 48 kHz 立体声未压缩 PCM |
| 多设备 | 同时推流到多台安卓设备，各自独立设置 |
| 安全配对 | TLS 控制通道，配合 ECDSA P-256 设备认证与 6 位配对码 |
| 自适应抖动缓冲 | 在音频线程上按链路质量逐客户端调整缓冲深度 |

## 防火墙

Gemacast 在电脑上使用三个入站端口。在 Wi-Fi 与 USB 网络共享场景下，这三个端口都必须能从手机所在的网络访问。

| 端口  | 协议 | 用途              |
|-------|------|-------------------|
| 23555 | UDP  | 设备发现          |
| 23556 | UDP  | 音频流            |
| 23559 | TCP  | TLS 控制（HTTPS） |

ADB 连接（TCP 23557、23558）通过 `adb reverse` 走回环地址，无需防火墙规则。

**Windows**：MSI 安装程序会自动创建规则。便携版需要手动在 Windows 防火墙中放行这些端口。

**Linux（ufw）**：
```bash
sudo ufw allow 23555,23556/udp
sudo ufw allow 23559/tcp
```

**Linux（firewalld）**：
```bash
sudo cp linux/gemacast.firewalld.xml /usr/lib/firewalld/services/gemacast.xml
sudo firewall-cmd --reload
sudo firewall-cmd --permanent --add-service=gemacast
sudo firewall-cmd --reload
```

**macOS**：首次启动时在系统弹窗中允许传入连接。

## 音频格式

| 格式   | 编码器               | 码率             | 帧大小     | 每帧延迟 |
|--------|----------------------|------------------|------------|----------|
| Opus   | Opus LowDelay/CELT   | 10-512 kbps      | 480 样本   | 10 ms    |
| 未压缩 | 原始 PCM（f32 立体声）| ~3072 kbps      | 480 样本   | 10 ms    |

所有格式均为 48 kHz 立体声。捕获流水线会在编码前将任意源采样率重采样到 48 kHz。

## 从源码编译

### 前置依赖

| 工具 | 版本 | 说明 |
|---|---|---|
| Rust | 1.97.1 | 已在 `rust-toolchain.toml` 中固定 |
| Clang | 任意 | `audiopus_sys`（Opus C 构建）需要 |
| CMake | 3.x | `audiopus_sys`（Opus C 构建）需要 |
| Bun | 1.x | 移动端前端构建 |
| Java | 17 (Temurin) | 仅安卓目标需要 |
| Android SDK + NDK | NDK 25.2.9519653 | 仅安卓目标需要 |
| cargo-ndk | 最新 | 仅安卓目标需要（`cargo install cargo-ndk`） |

Linux 还需要 PipeWire、ALSA、GTK3、WebKit2GTK 及相关开发头文件：

```bash
# Debian / Ubuntu
sudo apt-get install -y clang cmake pkg-config ninja-build meson \
  libasound2-dev libpipewire-0.3-dev libgtk-3-dev \
  libayatana-appindicator3-dev libwebkit2gtk-4.1-dev \
  librsvg2-dev patchelf libxdo-dev libudev-dev libdbus-1-dev

# Fedora
sudo dnf install clang cmake pkg-config ninja-build meson \
  alsa-lib-devel pipewire-devel gtk3-devel \
  libayatana-appindicator-gtk3-devel webkit2gtk4.1-devel \
  librsvg2-devel patchelf libxdo-devel systemd-devel dbus-devel
```

### 编译电脑端（Windows / Linux / macOS）

```bash
git clone https://github.com/justly110/gemacast.git
cd gemacast
cargo build --release -p gemacast-pc
```

生成的二进制位于 `target/release/gemacast-pc`（Windows 上为 `gemacast-pc.exe`）。

### 编译安卓端

```bash
cd gemacast/gemacast-mobile
bun install --frozen-lockfile
bunx tauri android build --apk
# 为现代 ARM64 手机生成体积更小的 APK
bunx tauri android build --apk --target aarch64 --split-per-abi
```

未签名的 APK 分别输出到
`gemacast-mobile/src-tauri/gen/android/app/build/outputs/apk/` 下的
`universal/release/` 与 `arm64/release/` 目录。

## 常见问题

<details>
<summary><b>手机找不到我的电脑</b></summary>
<br/>

两台设备必须处于同一网络，所以访客 Wi-Fi 或 VPN 即使在信号满格时也会隐藏你的电脑。防火墙必须放行 Gemacast，即 UDP 23555（设备发现）、UDP 23556（音频流）与 TCP 23559（控制通道）。Windows 只会在首次启动时询问一次，如果你关掉了那个弹窗，端口就会一直保持封锁状态。

</details>

<details>
<summary><b>真正的端到端延迟是多少？</b></summary>
<br/>

把三部分加起来：电脑上录音的 10 ms、传输往返时间（RTT）的一半，以及缓冲区里存着的数据。缓冲区通常占大头。手机在播放时会显示缓冲区与往返时间，你可以自己加出你的实际数值。

</details>

<details>
<summary><b>熄屏后缓冲区会涨到 200 ms 以上</b></summary>
<br/>

这是安卓在省电。熄屏时系统会让 Wi-Fi 芯片休眠，只按固定节奏（即 DTIM）唤醒。音频不再匀速到达，而是每 100 到 200 ms 成批到达。缓冲区会涨到足以覆盖它看到的最长间隙，这是预期行为，因为更小的缓冲区只会让播放卡顿。想压低延迟，请在设置中打开“保持屏幕常亮”，或改用 USB 网络共享 / ADB，这些场景下芯片不会休眠。

</details>

<details>
<summary><b>为什么需要配对这一步？</b></summary>
<br/>

没有配对，网络中的任何设备都能发起串流、查看你正在运行的应用列表，并改变电脑正在录制的内容。有了配对，你可以决定允许哪台手机连接。首次连接时授权一次，之后手机会记住这台电脑并顺畅连接。

</details>

<details>
<summary><b>那 6 位数字有什么用？</b></summary>
<br/>

它证明你的手机是直接与你的电脑通信，中间没有任何中转（即没有中间人）。两台设备各自利用只有这两者共享的信息独立算出这个码。如果中间夹了别的机器，两边的码会不一致，你立刻就能看出来。所以只需确认两块屏幕上显示的是同样的六位数字，然后批准即可。它不是密码，被别人看到也没关系。

</details>

<details>
<summary><b>音频有加密吗？</b></summary>
<br/>

没有，而且这是有意为之。配对过程受保护，但音频本身是明文传输的。这个应用的核心就是低延迟，而音频每秒会发出 100 个碎片。给每一个碎片加密解密都会在两端增加工作量并让每个碎片变大，而这恰好会表现为延迟。因此同一网络中的任何人理论上都可以监听。请只使用你信任的网络，或改用 USB。

</details>

## 许可证

[GPL-3.0-or-later](LICENSE)

## 第三方库致谢

### Rust

| Crate | 许可证 | 用途 |
|---|---|---|
| [tokio](https://crates.io/crates/tokio) | MIT | 异步运行时 |
| [axum](https://crates.io/crates/axum) | MIT | HTTP/WebSocket 控制服务器 |
| [tao](https://crates.io/crates/tao) | Apache-2.0 / MIT | 窗口与系统托盘事件循环（电脑端） |
| [tray-icon](https://crates.io/crates/tray-icon) | Apache-2.0 / MIT | 系统托盘图标（电脑端） |
| [tauri](https://crates.io/crates/tauri) | Apache-2.0 / MIT | 移动端应用框架 |
| [opus](https://crates.io/crates/opus)（[audiopus_sys](https://crates.io/crates/audiopus_sys)） | MIT / BSD-3 / ISC | Opus 音频编码绑定 |
| [oboe](https://crates.io/crates/oboe) | Apache-2.0 | 低延迟音频输出（安卓） |
| [cpal](https://crates.io/crates/cpal) | Apache-2.0 | 跨平台音频 I/O 回退 |
| [pipewire](https://crates.io/crates/pipewire) | MIT | PipeWire 音频捕获（Linux） |
| [screencapturekit](https://crates.io/crates/screencapturekit) | Apache-2.0 / MIT | 屏幕/音频捕获（macOS） |
| [rubato](https://crates.io/crates/rubato) | MIT / Apache-2.0 | 异步采样率转换 |
| [ringbuf](https://crates.io/crates/ringbuf) | MIT / Apache-2.0 | 无锁环形缓冲区 |
| [mdns-sd](https://crates.io/crates/mdns-sd) | Apache-2.0 / MIT | mDNS 服务发现 |
| [reqwest](https://crates.io/crates/reqwest) | MIT / Apache-2.0 | HTTP 客户端 |
| [rustls](https://crates.io/crates/rustls) | Apache-2.0 / MIT / ISC | TLS 实现 |
| [ring](https://crates.io/crates/ring) | Apache-2.0 / ISC / OpenSSL | 密码学原语（ECDSA、SHA-256） |
| [rcgen](https://crates.io/crates/rcgen) | Apache-2.0 / MIT | X.509 证书生成 |
| [serde](https://crates.io/crates/serde) / [serde_json](https://crates.io/crates/serde_json) | MIT / Apache-2.0 | 序列化 |
| [rfd](https://crates.io/crates/rfd) | MIT | 原生文件/消息对话框（电脑端） |
| [image](https://crates.io/crates/image) | MIT / Apache-2.0 | 托盘图标图像处理 |
| [semver](https://crates.io/crates/semver) | MIT / Apache-2.0 | 更新检查的语义化版本 |

### 前端（TypeScript）

| 包 | 许可证 | 用途 |
|---|---|---|
| [react](https://www.npmjs.com/package/react) / [react-dom](https://www.npmjs.com/package/react-dom) | MIT | UI 框架 |
| [zustand](https://www.npmjs.com/package/zustand) | MIT | 状态管理 |
| [tailwindcss](https://www.npmjs.com/package/tailwindcss) | MIT | 原子化 CSS |
| [lucide-react](https://www.npmjs.com/package/lucide-react) | ISC | 图标库 |
| [vite](https://www.npmjs.com/package/vite) | MIT | 构建工具与开发服务器 |
| [@tauri-apps/api](https://www.npmjs.com/package/@tauri-apps/api) | Apache-2.0 / MIT | Tauri IPC 桥接 |

### 安卓（Kotlin）

| 库 | 许可证 | 用途 |
|---|---|---|
| [Android Keystore API](https://developer.android.com/training/articles/keystore) | Apache-2.0 | 硬件级 ECDSA 密钥存储 |

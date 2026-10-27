import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { tauriBridge } from '../core/tauri-bridge';
import { useToastStore } from '../stores/toast-store';
import { useUpdateStore } from '../stores/update-store';

/**
 * Hook that drives the update lifecycle.
 *
 * Automatic background polling is disabled. Updates are checked strictly
 * on-demand when the user manually clicks "检查更新".
 */
export function useUpdater() {
  const store = useUpdateStore();

  // 手动触发检查更新
  const checkForUpdates = async () => {
    useUpdateStore.getState().setChecking();

    const currentStatus = useUpdateStore.getState().status;
    if (currentStatus !== 'ready' && currentStatus !== 'installing') {
      try {
        await tauriBridge.cleanupStaleUpdates();
      } catch {
        // 忽略非关键清理异常
      }
    }

    try {
      const result = await tauriBridge.checkForUpdate();
      if (result) {
        useUpdateStore.getState().setAvailable(result.version, result.downloadUrl, result.sha256);
      } else {
        useUpdateStore.getState().setUpToDate();
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      useUpdateStore.getState().setError(message);
      useToastStore.getState().show('error', '检查更新失败', message);
    }
  };

  // 检测从系统安装器返回的前台状态，不自动检查更新
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        useUpdateStore.getState().handleAppResume();
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  const startDownload = async () => {
    const { status, downloadUrl, sha256, version } = useUpdateStore.getState();

    if (status !== 'available' || !downloadUrl || !version || !sha256) return;

    const unlisten = await listen<number>('update-progress', (event) => {
      const current = useUpdateStore.getState();
      if (current.status === 'downloading') {
        useUpdateStore.getState().setDownloading(event.payload);
      }
    });

    useUpdateStore.getState().setDownloading(0);

    try {
      const apkPath = await tauriBridge.downloadUpdate({
        url: downloadUrl,
        sha256,
      });
      useUpdateStore.getState().setReady(version, apkPath);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      useUpdateStore.getState().setError(message);
      useToastStore.getState().show('error', '下载更新失败', message);
    } finally {
      unlisten();
    }
  };

  const installUpdate = async () => {
    const { status, apkPath } = useUpdateStore.getState();
    if (status !== 'ready' || !apkPath) return;

    useUpdateStore.getState().setInstalling();

    try {
      await tauriBridge.installApk({ path: apkPath });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      useUpdateStore.getState().setError(message);
      useToastStore.getState().show('error', '安装更新失败', message);
    }
  };

  const retry = () => {
    useUpdateStore.getState().reset();
  };

  return {
    state: store,
    checkForUpdates,
    startDownload,
    installUpdate,
    retry,
  };
}

import { useUpdateStore } from '../stores/update-store';

/**
 * Hook that drives the auto-update lifecycle.
 * (Disabled for custom build)
 */
export function useUpdater() {
  const store = useUpdateStore();

  // 禁用检查更新，直接保持在最新状态
  const checkForUpdates = async (): Promise<void> => {
    useUpdateStore.getState().setUpToDate();
  };

  const startDownload = async (): Promise<void> => {
    // 空实现
  };

  const installUpdate = async (): Promise<void> => {
    // 空实现
  };

  const retry = (): void => {
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

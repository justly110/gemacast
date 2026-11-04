import { Status } from '../../core/types';
import { useAppStore } from '../../stores/app-store';

export function AudioVisualizer() {
  const status = useAppStore((s) => s.status);
  const isPlaying = status === Status.Playing;

  if (
    status !== Status.Playing &&
    status !== Status.Paused &&
    status !== Status.Connected
  ) {
    return null;
  }

  return (
    <div
      className="inline-flex items-end gap-[3px] h-3.5 px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20"
      title={isPlaying ? '正在传输音频数据' : '音频流已就绪'}
      aria-label={isPlaying ? '音频波形跳动中' : '音频静止'}
    >
      <span
        className={`w-0.75 rounded-full bg-primary transition-all duration-300 ${
          isPlaying
            ? 'h-3 animate-[music-bar-1_0.8s_ease-in-out_infinite]'
            : 'h-1 opacity-50'
        }`}
      />
      <span
        className={`w-0.75 rounded-full bg-primary transition-all duration-300 ${
          isPlaying
            ? 'h-2.5 animate-[music-bar-2_0.6s_ease-in-out_infinite]'
            : 'h-1.5 opacity-50'
        }`}
      />
      <span
        className={`w-0.75 rounded-full bg-primary transition-all duration-300 ${
          isPlaying
            ? 'h-3.5 animate-[music-bar-3_1.0s_ease-in-out_infinite]'
            : 'h-1 opacity-50'
        }`}
      />
      <span
        className={`w-0.75 rounded-full bg-primary transition-all duration-300 ${
          isPlaying
            ? 'h-2 animate-[music-bar-4_0.7s_ease-in-out_infinite]'
            : 'h-1.5 opacity-50'
        }`}
      />
    </div>
  );
}

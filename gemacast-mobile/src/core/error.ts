export enum ErrorCode {
  NETWORK_FAILED_TO_START_DISCOVERY = 'NETWORK_FAILED_TO_START_DISCOVERY',
  NETWORK_FAILED_TO_STOP_DISCOVERY = 'NETWORK_FAILED_TO_STOP_DISCOVERY',
  NETWORK_DISCOVERY_ERROR = 'NETWORK_DISCOVERY_ERROR',
  NETWORK_STREAMER_TIMEOUT = 'NETWORK_STREAMER_TIMEOUT',
  NETWORK_RECONNECT_FAILED = 'NETWORK_RECONNECT_FAILED',
  AUDIO_PLAYBACK_ERROR = 'AUDIO_PLAYBACK_ERROR',
  AUDIO_FAILED_TO_START_PLAYBACK = 'AUDIO_FAILED_TO_START_PLAYBACK',
  AUDIO_FAILED_TO_STOP_PLAYBACK = 'AUDIO_FAILED_TO_STOP_PLAYBACK',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export type ErrorOptions = {
  code: ErrorCode;
  message?: string;
  cause?: unknown;
};

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_FAILED_TO_START_DISCOVERY]: '启动 UDP 设备发现失败',
  [ErrorCode.NETWORK_FAILED_TO_STOP_DISCOVERY]: '停止 UDP 设备发现失败',
  [ErrorCode.NETWORK_DISCOVERY_ERROR]: '后台设备发现过程中发生错误',
  [ErrorCode.NETWORK_STREAMER_TIMEOUT]: '电脑端推流已无响应 — 正在尝试重连',
  [ErrorCode.NETWORK_RECONNECT_FAILED]: '多次尝试后仍无法恢复连接',
  [ErrorCode.AUDIO_PLAYBACK_ERROR]: '音频播放过程中发生错误',
  [ErrorCode.AUDIO_FAILED_TO_START_PLAYBACK]: '启动音频播放失败',
  [ErrorCode.AUDIO_FAILED_TO_STOP_PLAYBACK]: '停止音频播放失败',
  [ErrorCode.UNKNOWN_ERROR]: '发生未知错误',
};

export class GemaCastError extends Error {
  public readonly code: ErrorCode;
  public readonly userMessage: string;

  constructor(options: ErrorOptions) {
    super(options.message ?? ERROR_MESSAGES[options.code], {
      cause: options.cause,
    });

    this.name = 'GemaCastError';
    this.code = options.code;
    this.userMessage = options.message ?? ERROR_MESSAGES[this.code];
  }

  public static failedToStartDiscovery(error: unknown) {
    let message = ERROR_MESSAGES[ErrorCode.NETWORK_FAILED_TO_START_DISCOVERY];
    if (typeof error === 'string' && error.includes('already in use')) {
      message = error;
    }
    return new GemaCastError({
      code: ErrorCode.NETWORK_FAILED_TO_START_DISCOVERY,
      message,
      cause: error,
    });
  }

  public static failedToStopDiscovery(error: unknown) {
    return new GemaCastError({
      code: ErrorCode.NETWORK_FAILED_TO_STOP_DISCOVERY,
      message: ERROR_MESSAGES[ErrorCode.NETWORK_FAILED_TO_STOP_DISCOVERY],
      cause: error,
    });
  }

  public static discoveryError(error: unknown) {
    return new GemaCastError({
      code: ErrorCode.NETWORK_DISCOVERY_ERROR,
      message: ERROR_MESSAGES[ErrorCode.NETWORK_DISCOVERY_ERROR],
      cause: error,
    });
  }

  public static playbackError(error: unknown) {
    return new GemaCastError({
      code: ErrorCode.AUDIO_PLAYBACK_ERROR,
      message: ERROR_MESSAGES[ErrorCode.AUDIO_PLAYBACK_ERROR],
      cause: error,
    });
  }

  public static failedToStartPlayback(error: unknown) {
    return new GemaCastError({
      code: ErrorCode.AUDIO_FAILED_TO_START_PLAYBACK,
      message: ERROR_MESSAGES[ErrorCode.AUDIO_FAILED_TO_START_PLAYBACK],
      cause: error,
    });
  }

  public static failedToStopPlayback(error: unknown) {
    return new GemaCastError({
      code: ErrorCode.AUDIO_FAILED_TO_STOP_PLAYBACK,
      message: ERROR_MESSAGES[ErrorCode.AUDIO_FAILED_TO_STOP_PLAYBACK],
      cause: error,
    });
  }

  public static streamerTimeout() {
    return new GemaCastError({
      code: ErrorCode.NETWORK_STREAMER_TIMEOUT,
    });
  }

  public static reconnectFailed() {
    return new GemaCastError({
      code: ErrorCode.NETWORK_RECONNECT_FAILED,
    });
  }

  public static from(error: unknown, fallbackCode = ErrorCode.UNKNOWN_ERROR) {
    if (error instanceof GemaCastError) {
      return error;
    }

    if (error instanceof Error) {
      return new GemaCastError({
        code: fallbackCode,
        message: error.message,
        cause: error,
      });
    }

    return new GemaCastError({
      code: fallbackCode,
      message: String(error),
    });
  }
}

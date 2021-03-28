interface LogConfig {
  enabled: boolean;
  debug: boolean;
  verbose: boolean;
}

export const LOG_CONFIG = {
  LiveParameterListener: {
    enabled: true,
    debug: true,
    verbose: true,
  } as LogConfig,

  LiveFader: {
    enabled: true,
    debug: true,
    verbose: true,
  } as LogConfig,

  ParameterScene: {
    enabled: true,
    debug: true,
    verbose: true,
  } as LogConfig,
};

export const LOG_ALL_MODULES = false;

export const LOG_TO_OUTLET = true;
export const OUTLET_LOG_LINES = 10;

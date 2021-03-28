import { LogLevels } from "./lib_Log";

interface LogConfig {
  enabled: boolean;
  debug: boolean;
  verbose: boolean;
}

export const LOG_CONFIG = {
  LiveParameterListener: {
    enabled: true,
    debug: true,
    verbose: false,
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

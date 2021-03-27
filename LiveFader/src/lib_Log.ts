import { LOG_ALL_MODULES, LOG_CONFIG } from "./config_log";

export const log = (x: any, y?: any, z?: any) => {
  for (var i = 0, len = arguments.length; i < len; i++) {
    var message = arguments[i];
    var outMessage;
    if (message && message.toString) {
      var s = message.toString();
      if (s.indexOf("[object ") >= 0) {
        s = JSON.stringify(message);
      }
      outMessage = s;
    } else if (message === null) {
      outMessage = "<null>";
    } else {
      outMessage = message;
    }

    post(outMessage);
    outlet(0, "prepend", outMessage + "\n");
  }
  post("\n");
};

export enum LogLevels {
  Debug = "debug",
  Verbose = "verbose",
}

export class Log {
  constructor(private moduleName: keyof typeof LOG_CONFIG) {}

  logIfEnabled = (level: "debug" | "verbose", ...args: any[]) => {
    if (
      LOG_ALL_MODULES ||
      (LOG_CONFIG[this.moduleName].enabled &&
        LOG_CONFIG[this.moduleName][level])
    )
      log(args);
  };

  debug = (...args: any[]) => this.logIfEnabled("debug", ...args);

  verbose = (...args: any[]) => this.logIfEnabled("verbose", ...args);

  error = (...args: any[]) => log(this.moduleName, "error", ...args);
}

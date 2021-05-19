import {
  LOG_ALL_LEVEL,
  LOG_ALL_MODULES,
  LOG_CONFIG,
  LOG_TO_OUTLET,
  OUTLET_LOG_LINES,
} from "./config_log";

let outletLog: string[] = [];

// Based on https://cycling74.com/forums/tutorial-using-the-javascript-live-api-in-max-for-live/replies/1#reply-5fd76050b2a7ee5f9fbcfb78
export function log(x: any, y?: any, z?: any) {
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

    if (LOG_TO_OUTLET) {
      outletLog = [outMessage, ...outletLog];
      outletLog = outletLog.slice(0, OUTLET_LOG_LINES);
      outlet(0, "set", outletLog.join("\n"));
    }
  }
  post("\n");
}

export enum LogLevels {
  Debug = "debug",
  Verbose = "verbose",
}

export class Log {
  constructor(private moduleName: keyof typeof LOG_CONFIG) {}

  logIfEnabled = (level: "debug" | "verbose", ...args: any[]) => {
    if (
      LOG_ALL_MODULES ||
      (LOG_CONFIG[this.moduleName].enabled && LOG_CONFIG[this.moduleName][level]) ||
      LOG_ALL_LEVEL[level]
    )
      log(args);
  };

  debug = (...args: any[]) => this.logIfEnabled("debug", ...args);

  verbose = (...args: any[]) => this.logIfEnabled("verbose", ...args);

  error = (...args: any[]) => log(this.moduleName, "error", ...args);
}

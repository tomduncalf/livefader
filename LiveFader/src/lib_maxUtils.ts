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

const ENABLED_LOG_MODULES: string[] = ["LiveParameterListener"];

export class Log {
  constructor(private moduleName: string) {}

  logIfEnabled = (...args: any[]) => {
    if (
      ENABLED_LOG_MODULES.length === 0 ||
      ENABLED_LOG_MODULES.indexOf(this.moduleName) > -1
    )
      log(args);
  };

  debug = (...args: any[]) =>
    this.logIfEnabled(this.moduleName, "debug", ...args);

  verbose = (...args: any[]) =>
    this.logIfEnabled(this.moduleName, "verbose", ...args);

  error = (...args: any[]) => log(this.moduleName, "error", ...args);
}

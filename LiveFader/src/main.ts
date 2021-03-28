import { log } from "./lib_Log";
import { LiveFader } from "./LiveFader";

log("__________________");
log("Script reloaded at: " + new Date());

inlets = 5;
outlets = 1;

let instance: LiveFader;

// Defer startup until we get a bang from live.thisdevice otherwise Live API will not be ready
function bang() {
  instance = new LiveFader();
  instance.patcher = this.patcher;
}

// Need to hook up to inlets/outlets at this main entry point
function msg_int(value: number) {
  if (instance) instance.handleMessage(inlet, value);
}

function msg_float(value: number) {
  if (instance) instance.handleMessage(inlet, value);
}

// .ts files with this at the end become a script usable in a [js] or [jsui] object
let module = {};
export = {};

import { log } from "./lib_Log";
import { LiveFader } from "./LiveFader";

log("__________________");
log("Script reloaded at: " + new Date());

inlets = 4;
outlets = 1;

const instance = new LiveFader();

// Need to hook up to inlets/outlets at this main entry point
function msg_int(value: number) {
  instance.handleMessage(inlet, value);
}

function msg_float(value: number) {
  instance.handleMessage(inlet, value);
}

// .ts files with this at the end become a script usable in a [js] or [jsui] object
let module = {};
export = {};

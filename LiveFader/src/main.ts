import { log } from "./lib_maxUtils";
import { LiveParameterListener } from "./LiveParameterListener";

log("__________________");
log("Script reloaded at: " + new Date());

const listener = new LiveParameterListener();

// .ts files with this at the end become a script usable in a [js] or [jsui] object
let module = {};
export = {};

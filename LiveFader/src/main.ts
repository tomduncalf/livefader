import { log } from "./lib_Log";
import { LiveFader } from "./LiveFader";

log("__________________");
log("Script reloaded at: " + new Date());

const liveFader = new LiveFader();
log(liveFader.state);

// .ts files with this at the end become a script usable in a [js] or [jsui] object
let module = {};
export = {};

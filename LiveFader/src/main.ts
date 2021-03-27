import { Test } from "./Test";

var t = new Test();
t.run();

// .ts files with this at the end become a script usable in a [js] or [jsui] object
let module = {};
export = {};

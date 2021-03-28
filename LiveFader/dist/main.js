"use strict";
var lib_Log_1 = require("./lib_Log");
var LiveFader_1 = require("./LiveFader");
lib_Log_1.log("__________________");
lib_Log_1.log("Script reloaded at: " + new Date());
inlets = 4;
outlets = 1;
var instance = new LiveFader_1.LiveFader();
// Need to hook up to inlets/outlets at this main entry point
function msg_int(value) {
    instance.handleMessage(inlet, value);
}
function msg_float(value) {
    instance.handleMessage(inlet, value);
}
// .ts files with this at the end become a script usable in a [js] or [jsui] object
var module = {};
module.exports = {};

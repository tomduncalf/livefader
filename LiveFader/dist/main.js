"use strict";
var lib_Log_1 = require("./lib_Log");
var LiveParameterListener_1 = require("./LiveParameterListener");
lib_Log_1.log("__________________");
lib_Log_1.log("Script reloaded at: " + new Date());
var listener = new LiveParameterListener_1.LiveParameterListener();
// .ts files with this at the end become a script usable in a [js] or [jsui] object
var module = {};
module.exports = {};

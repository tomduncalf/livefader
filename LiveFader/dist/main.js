"use strict";
var lib_Log_1 = require("./lib_Log");
var LiveFader_1 = require("./LiveFader");
lib_Log_1.log("__________________");
lib_Log_1.log("Script reloaded at: " + new Date());
var liveFader = new LiveFader_1.LiveFader();
lib_Log_1.log(liveFader.state);
// .ts files with this at the end become a script usable in a [js] or [jsui] object
var module = {};
module.exports = {};

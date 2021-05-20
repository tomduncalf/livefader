"use strict";
autowatch = 0;
var lib_Log_1 = require("./lib_Log");
var LiveFader_1 = require("./LiveFader");
lib_Log_1.log("__________________");
lib_Log_1.log("Script reloaded at: " + new Date());
inlets = Object.keys(LiveFader_1.Inlets).length;
outlets = Object.keys(LiveFader_1.Outlets).length;
setinletassist(-1, function (i) { return assist(LiveFader_1.Inlets[Object.keys(LiveFader_1.Inlets)[i]].description); });
setoutletassist(-1, function (i) { return assist(LiveFader_1.Outlets[Object.keys(LiveFader_1.Outlets)[i]].description); });
var instance;
var savedState = "";
// Defer startup until we get a bang from live.thisdevice otherwise Live API will not be ready
function bang() {
    instance = new LiveFader_1.LiveFader();
    // @ts-ignore
    instance.patcher = this.patcher;
    if (savedState)
        instance.loadSavedState(savedState);
}
function reset_scene() {
    instance.resetScene();
}
function reset_all() {
    instance.reset();
}
function cleanup() {
    instance.cleanup();
}
function popout() {
    instance.openPopout();
}
function dump() {
    instance.dumpSavedState();
}
// Need to hook up to inlets/outlets at this main entry point
function msg_int(value) {
    if (instance)
        instance.handleMessage(inlet, value);
}
function msg_float(value) {
    if (instance)
        instance.handleMessage(inlet, value);
}
function scene_button(buttonIndex, state) {
    instance.handleSceneButton(buttonIndex, state === 1);
}
// Handle loading and saving state - this is stored in the pattr object
// Note that you need to call notifyclients() whenever the state is updated
function getvalueof() {
    var state = JSON.stringify(instance.getSavedState());
    return state;
}
function setvalueof(state) {
    if (instance)
        instance.loadSavedState(state);
    else
        savedState = state;
}
// .ts files with this at the end become a script usable in a [js] or [jsui] object
var module = {};
module.exports = {};

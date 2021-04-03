autowatch = 0;

import { log } from "./lib_Log";
import { LiveFader } from "./LiveFader";

log("__________________");
log("Script reloaded at: " + new Date());

inlets = 5;
outlets = 2;

let instance: LiveFader;

let savedState = "";

// Defer startup until we get a bang from live.thisdevice otherwise Live API will not be ready
function bang() {
  instance = new LiveFader();
  // @ts-ignore
  instance.patcher = this.patcher;

  if (savedState) instance.loadSavedState(savedState);
}

function cleanup() {
  instance.cleanup();
}

function fullscreen() {
  instance.openFullScreen();
}

function dump() {
  instance.dumpSavedState();
}

// Need to hook up to inlets/outlets at this main entry point
function msg_int(value: number) {
  if (instance) instance.handleMessage(inlet, value);
}

function msg_float(value: number) {
  if (instance) instance.handleMessage(inlet, value);
}

// Handle loading and saving state - this is stored in the pattr object
// Note that you need to call notifyclients() whenever the state is updated
function getvalueof() {
  const state = JSON.stringify(instance.getSavedState());
  return state;
}

function setvalueof(state: string) {
  if (instance) instance.loadSavedState(state);
  else savedState = state;
}

// .ts files with this at the end become a script usable in a [js] or [jsui] object
let module = {};
export = {};

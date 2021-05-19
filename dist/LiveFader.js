"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveFader = exports.Outlets = exports.Inlets = void 0;
var lib_Log_1 = require("./lib_Log");
var lib_math_1 = require("./lib_math");
var LiveParameterListener_1 = require("./LiveParameterListener");
var models_1 = require("./models");
var CHAR_CODE_A = 65;
exports.Inlets = {
    LeftButton: { index: 0, description: "Left Button" },
    RightButton: { index: 1, description: "Right Button" },
    Fader: { index: 2, description: "Fader" },
    SceneButtons: { index: 3, description: "Scene Buttons (via funnel)" },
};
exports.Outlets = {
    Debug: { index: 0, description: "Debug" },
    LeftText: { index: 1, description: "Left Text" },
    RightText: { index: 2, description: "Right Text" },
    LeftButton: { index: 3, description: "Left Button" },
    RightButton: { index: 4, description: "Right Button" },
    SceneButtons: { index: 5, description: "Scene Buttons (via route)" },
};
var State;
(function (State) {
    State[State["Normal"] = 0] = "Normal";
    State[State["Mapping"] = 1] = "Mapping";
    State[State["Crossfading"] = 2] = "Crossfading";
})(State || (State = {}));
// Main entry point class which hooks everything together
var LiveFader = /** @class */ (function () {
    function LiveFader() {
        var _this = this;
        this.log = new lib_Log_1.Log("LiveFader");
        this.state = State.Normal;
        // Keep a reference to the parameters which are locked by either of the current scenes
        // so we don't have to calculate this every time the crossfader changes
        this.activeLockedParameters = [];
        // Keep track of every parameter which is locked in any scene, so we can quickly
        // access its LiveApiObject to set the value, and also so we can keep track of
        // the last value the user set it to so we know what value to return to
        this.trackedParametersById = {};
        this.liveParameterListener = new LiveParameterListener_1.LiveParameterListener();
        this.currentMappingScene = undefined;
        this.currentFaderValue = 0;
        this.lastFaderValue = 0;
        this.cleanup = function () {
            _this.liveParameterListener.removeListeners();
        };
        this.reset = function () {
            _this.log.debug("reset");
            // Populate 8 scenes to start, named A to H
            _this.scenes = __spreadArray([], new Array(8)).map(function (_, i) { return new models_1.ParameterScene(String.fromCharCode(CHAR_CODE_A + i)); });
            _this.activeScenes = [_this.scenes[0], _this.scenes[1]];
            _this.activeSceneIndices = [0, 1];
            _this.updateActiveLockedParameters();
            _this.updateFader(true);
            _this.updateUI();
        };
        this.handleMessage = function (inlet, value) {
            if (inlet === exports.Inlets.LeftButton.index || inlet === exports.Inlets.RightButton.index) {
                _this.handleFaderButton(inlet, value);
            }
            else if (inlet === exports.Inlets.Fader.index) {
                _this.handleFader(value);
            }
        };
        this.handleFader = function (value) {
            _this.currentFaderValue = value;
        };
        this.setState = function (state) {
            // this.log.verbose(`Entering state ${state}`);
            _this.state = state;
        };
        this.updateFader = function (force) {
            if (force === void 0) { force = false; }
            if (!force && _this.currentFaderValue === _this.lastFaderValue)
                return;
            _this.log.verbose("Update fader to " + _this.currentFaderValue);
            _this.handleFaderUpdate();
            _this.lastFaderValue = _this.currentFaderValue;
        };
        this.handleFaderUpdate = function () {
            var previousState = _this.state;
            _this.setState(State.Crossfading);
            _this.activeLockedParameters.forEach(function (activeLockedParameter) {
                var values = [
                    activeLockedParameter.lockedParameters[0]
                        ? activeLockedParameter.lockedParameters[0].lockedValue
                        : activeLockedParameter.trackedParameter.lastUserValue,
                    activeLockedParameter.lockedParameters[1]
                        ? activeLockedParameter.lockedParameters[1].lockedValue
                        : activeLockedParameter.trackedParameter.lastUserValue,
                ];
                var newValue = lib_math_1.lerp(values[0], values[1], _this.currentFaderValue);
                activeLockedParameter.trackedParameter.parameter.setValue(newValue);
            });
            _this.setState(previousState);
        };
        this.handleFaderButton = function (inlet, value) {
            var _a;
            if (value === 0) {
                _this.log.debug("Enter normal mode");
                var wasMapping = _this.state === State.Mapping;
                _this.setState(State.Normal);
                _this.activeSceneButtonIndex = undefined;
                if (wasMapping) {
                    _this.log.debug(_this.currentMappingScene);
                    (_a = _this.currentMappingScene) === null || _a === void 0 ? void 0 : _a.forEachLockedParameter(function (lockedParameter) {
                        lockedParameter.parameter.setValue(_this.trackedParametersById[lockedParameter.parameter.id].lastUserValue);
                    });
                }
                _this.currentMappingScene = undefined;
            }
            else {
                _this.log.debug("Enter mapping mode for " + (inlet === exports.Inlets.LeftButton.index ? "left" : "right") + " scene");
                _this.setState(State.Mapping);
                var buttonIndex = inlet === exports.Inlets.LeftButton.index ? 0 : 1;
                _this.currentMappingScene = _this.activeScenes[buttonIndex];
                _this.activeSceneButtonIndex = buttonIndex;
                outlet(inlet === exports.Inlets.LeftButton.index ? exports.Outlets.RightButton.index : exports.Outlets.LeftButton.index, "set", 0);
            }
            _this.updateUI();
        };
        this.handleActiveParameterValueChanged = function (value, parameter) {
            if (_this.state === State.Normal) {
                if (_this.trackedParametersById[parameter.id] !== undefined) {
                    _this.trackedParametersById[parameter.id].lastUserValue = value;
                    _this.log.verbose("Updating last tracked value of parameter " + parameter.id + " (" + parameter.name + ") to " + value);
                }
            }
            else if (_this.state === State.Mapping) {
                if (!_this.currentMappingScene.isParameterLocked(parameter)) {
                    _this.currentMappingScene.addLockedParameter(parameter, value);
                    _this.maybeAddTrackedParameter(parameter, value);
                    _this.updateActiveLockedParameters();
                }
                else {
                    _this.currentMappingScene.lockedParametersById[parameter.id].lockedValue = value;
                    _this.log.verbose("Updating locked parameter " + parameter.name + " " + parameter.id + " target to " + value + " in scene " + _this.currentMappingScene.name);
                    // this.log.debug(this.scenes);
                }
                _this.updateUI();
                notifyclients();
            }
            else if (_this.state === State.Crossfading) {
                // Do nothing
            }
        };
        this.maybeAddTrackedParameter = function (parameter, value) {
            if (_this.trackedParametersById[parameter.id] === undefined) {
                _this.trackedParametersById[parameter.id] = new models_1.TrackedParameter(parameter, value);
                _this.log.debug("Adding tracked parameter " + parameter.id + " with value " + value);
            }
        };
        this.initialiseTrackedParameters = function () {
            _this.trackedParametersById = {};
            _this.scenes.forEach(function (scene) {
                scene.forEachLockedParameter(function (lockedParameter) {
                    if (!_this.trackedParametersById[lockedParameter.parameter.id]) {
                        _this.trackedParametersById[lockedParameter.parameter.id] = new models_1.TrackedParameter(lockedParameter.parameter, lockedParameter.parameter.value);
                    }
                });
            });
        };
        this.updateActiveLockedParameters = function () {
            // Use a dictionary for easier construction of the array
            var activeLockedParametersObj = {};
            _this.activeScenes[0].forEachLockedParameter(function (lockedParameter) {
                activeLockedParametersObj[lockedParameter.parameter.id] = {
                    trackedParameter: _this.trackedParametersById[lockedParameter.parameter.id],
                    lockedParameters: [lockedParameter, undefined],
                };
            });
            _this.activeScenes[1].forEachLockedParameter(function (lockedParameter) {
                lib_Log_1.log(lockedParameter);
                if (activeLockedParametersObj[lockedParameter.parameter.id]) {
                    activeLockedParametersObj[lockedParameter.parameter.id].lockedParameters[1] =
                        lockedParameter;
                }
                else {
                    activeLockedParametersObj[lockedParameter.parameter.id] = {
                        trackedParameter: _this.trackedParametersById[lockedParameter.parameter.id],
                        lockedParameters: [undefined, lockedParameter],
                    };
                }
            });
            _this.log.verbose(activeLockedParametersObj);
            // Convert it to an array
            _this.activeLockedParameters = Object.keys(activeLockedParametersObj).map(function (k) { return activeLockedParametersObj[Number(k)]; });
        };
        this.updateUI = function () {
            outlet(exports.Outlets.LeftText.index, "set", _this.activeScenes[0].getDescription());
            outlet(exports.Outlets.RightText.index, "set", _this.activeScenes[1].getDescription());
            _this.setAllSceneButtonsOff();
            if (_this.activeSceneButtonIndex !== undefined)
                _this.setSceneButton(_this.activeSceneIndices[_this.activeSceneButtonIndex], true);
        };
        this.openPopout = function () {
            _this.patcher.message("script", "send", "window", "flags", "nomenu");
            _this.patcher.message("script", "send", "window", "flags", "float");
            _this.patcher.message("script", "send", "window", "exec");
            _this.patcher.front();
        };
        this.handleSceneButton = function (sceneIndex, state) {
            if (_this.activeSceneButtonIndex === undefined) {
                _this.setAllSceneButtonsOff();
                return;
            }
            if (state) {
                _this.setActiveScene(_this.activeSceneButtonIndex, sceneIndex);
                _this.currentMappingScene = _this.scenes[sceneIndex];
            }
            _this.updateUI();
        };
        this.setActiveScene = function (buttonIndex, sceneIndex) {
            _this.activeScenes[buttonIndex] = _this.scenes[sceneIndex];
            _this.activeSceneIndices[buttonIndex] = sceneIndex;
            _this.updateActiveLockedParameters();
            _this.updateFader(true);
            _this.updateUI();
        };
        this.setSceneButton = function (sceneIndex, state) {
            outlet(exports.Outlets.SceneButtons.index, sceneIndex, "set", state ? 1 : 0);
        };
        this.setAllSceneButtonsOff = function () {
            for (var i = 0; i < 8; i++)
                _this.setSceneButton(i, false);
        };
        this.getSavedState = function () {
            var state = {
                scenes: _this.scenes.map(function (scene) { return ({
                    name: scene.name,
                    description: scene.description,
                    lockedParameters: Object.keys(scene.lockedParametersById).map(function (k) {
                        var lockedParameter = scene.lockedParametersById[k];
                        return {
                            path: lockedParameter.parameter.path,
                            lockedValue: lockedParameter.lockedValue,
                        };
                    }),
                }); }),
                activeSceneIndices: _this.activeSceneIndices,
            };
            return state;
        };
        this.dumpSavedState = function () {
            _this.log.debug(_this.getSavedState());
        };
        this.loadSavedState = function (savedState) {
            _this.log.debug("loadSavedState: " + savedState);
            var parsed = JSON.parse(savedState);
            _this.scenes = parsed.scenes.map(function (s) { return models_1.ParameterScene.hydrateFromSavedState(s); });
            _this.activeScenes = [
                _this.scenes[parsed.activeSceneIndices[0]],
                _this.scenes[parsed.activeSceneIndices[1]],
            ];
            _this.initialiseTrackedParameters();
            _this.updateActiveLockedParameters();
            _this.updateUI();
        };
        lib_Log_1.log("LiveFader started");
        this.reset();
        this.liveParameterListener.onActiveParameterValueChanged =
            this.handleActiveParameterValueChanged;
        // Handle crossfader input at 30fps rather than continuosly to help with performance
        this.faderUpdateTask = new Task(this.updateFader, this);
        this.faderUpdateTask.interval = 1000 / 30;
        this.faderUpdateTask.repeat();
    }
    return LiveFader;
}());
exports.LiveFader = LiveFader;

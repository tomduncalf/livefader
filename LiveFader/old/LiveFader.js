inlets = 4;
outlets = 1;
function log(x, y, z) {
    for (var i = 0, len = arguments.length; i < len; i++) {
        var message = arguments[i];
        var outMessage;
        if (message && message.toString) {
            var s = message.toString();
            if (s.indexOf("[object ") >= 0) {
                s = JSON.stringify(message);
            }
            outMessage = s;
        }
        else if (message === null) {
            outMessage = "<null>";
        }
        else {
            outMessage = message;
        }
        post(outMessage);
        outlet(0, "prepend", outMessage + "\n");
    }
    post("\n");
}
function getById(id) {
    var api = new LiveAPI();
    api.id = Number(id);
    return api;
}
log("___________________________________________________");
log("Reload:", new Date());
/*******************************
 * Selected property listeners *
 *******************************/
var activeTrackPath = "";
var activeDevicePath = "";
var activeParamPath = "";
var activeParam;
var trackListener = new LiveAPI(function (v) {
    // log("trackListener " + v);
    if (v[0] === "selected_track") {
        var track = getById(v[2]);
        activeTrackPath = track.unquotedpath;
        // log("track " + track.get("name"));
        setupDeviceListener();
    }
});
trackListener.property = "selected_track";
trackListener.path = "live_set view";
var deviceListener = new LiveAPI(function (v) {
    // log("deviceListener " + v);
    if (v[0] === "selected_device") {
        var device = getById(v[2]);
        activeDevicePath = device.unquotedpath;
        // log("deviceListener " + device.get("name"));
    }
});
function setupDeviceListener() {
    deviceListener.property = "selected_device";
    deviceListener.path = activeTrackPath + " view";
}
var paramListener = new LiveAPI(function (v) {
    // log("paramListener " + v);
    if (v[0] === "selected_parameter" && v[2] > 0) {
        activeParam = getById(v[2]);
        activeParamPath = activeParam.unquotedpath;
        setupParamValueListener();
        handleActiveParamChanged();
    }
});
function setupParamListener() {
    paramListener.property = "selected_parameter";
    paramListener.path = "live_set view";
}
setupParamListener();
var propertyValueListener = new LiveAPI(function (v) {
    // log("propertyValueListener " + v);
    handleActiveParamValueChange(v[1]);
});
function setupParamValueListener() {
    propertyValueListener.property = "value";
    propertyValueListener.path = activeParamPath;
}
// var scenes: Scene[] = [
//   {
//     name: "A",
//     lockedParameters: [],
//   },
//   {
//     name: "B",
//     lockedParameters: [],
//   },
// ];
var scenes = [
    {
        name: "A",
        lockedParameters: [
            { path: "live_set tracks 2 devices 1 parameters 16", targetValue: 24 },
            { path: "live_set tracks 2 devices 1 parameters 20", targetValue: 24 },
            { path: "live_set tracks 2 devices 1 parameters 24", targetValue: 24 },
            { path: "live_set tracks 2 devices 1 parameters 28", targetValue: 24 },
            { path: "live_set tracks 2 devices 1 parameters 12", targetValue: 80 },
            {
                path: "live_set tracks 2 devices 1 parameters 14",
                targetValue: 0.1269841343164444
            },
            {
                path: "live_set tracks 2 devices 1 parameters 18",
                targetValue: 0.5396825671195984
            },
            {
                path: "live_set tracks 2 devices 1 parameters 22",
                targetValue: 0.6349206566810608
            },
            {
                path: "live_set tracks 2 devices 1 parameters 26",
                targetValue: 0.2460317462682724
            },
            { path: "live_set tracks 2 devices 1 parameters 30", targetValue: 0 },
            { path: "live_set tracks 2 devices 2 parameters 2", targetValue: 0 },
            { path: "live_set tracks 2 devices 2 parameters 15", targetValue: 0 },
            { path: "live_set tracks 2 devices 2 parameters 18", targetValue: 0 },
            { path: "live_set tracks 2 devices 2 parameters 41", targetValue: 1 },
        ]
    },
    { name: "B", lockedParameters: [] },
];
for (var i = 0; i < scenes.length; i++) {
    var scene = scenes[i];
    for (var j = 0; j < scene.lockedParameters.length; j++) {
        var param = scene.lockedParameters[j];
        var apiObject = new LiveAPI(param.path);
        trackedParameters[param.path] = {
            lastValue: apiObject.get("value"),
            liveApiObject: apiObject
        };
    }
}
var activeScenes = [scenes[0], scenes[1]];
var targetMappingScene = scenes[1];
function getLockedParameterByPath(path, scene) {
    for (var i = 0; i < scene.lockedParameters.length; i++) {
        var lockedParameter = scene.lockedParameters[i];
        if (lockedParameter.path === path)
            return lockedParameter;
    }
    return undefined;
}
function createLockedParameter(path, scene) {
    var lockedParameter = { path: path, targetValue: 0 };
    scene.lockedParameters.push(lockedParameter);
    return lockedParameter;
}
function getOrCreateLockedParameterByPath(path, scene) {
    var param = getLockedParameterByPath(path, scene);
    if (param)
        return param;
    else
        return createLockedParameter(path, scene);
}
var trackedParameters = {};
function isParameterTracked(path) {
    return Object.keys(trackedParameters).indexOf(path) > -1;
}
/***************
 * Other state *
 ***************/
var mappingModeActive = false;
var crossfading = false;
/*****************
 * Handle inlets *
 *****************/
function msg_int(v) {
    // log(inlet);
    handleSceneButton(inlet, v);
    if (inlet === 3) {
        this.patcher.message("script", "send", "window", "flags", "nomenu");
        this.patcher.message("script", "send", "window", "flags", "float");
        this.patcher.message("script", "send", "window", "exec");
        this.patcher.front();
    }
}
var crossfaderTarget = 0;
var lastCrossfaderTarget = 0;
function msg_float(v) {
    // log(v);
    crossfaderTarget = v;
    // handleCrossfader(v);
}
var updateTask = new Task(function () {
    if (crossfaderTarget === lastCrossfaderTarget)
        return;
    handleCrossfader(crossfaderTarget);
    lastCrossfaderTarget = crossfaderTarget;
}, this);
updateTask.interval = 1000 / 30;
updateTask.repeat();
/***********************
 * Mapping setup logic *
 ***********************/
function handleActiveParamChanged() {
    log("handleActiveParamChanged " + activeParam.get("name"));
    if (isParameterTracked(activeParamPath))
        trackedParameters[activeParamPath].lastValue = activeParam.get("value");
}
function handleActiveParamValueChange(newValue) {
    if (!mappingModeActive && !crossfading && isParameterTracked(activeParamPath))
        trackedParameters[activeParamPath].lastValue = activeParam.get("value");
    // log(trackedParameterOriginalValues);
    if (!mappingModeActive)
        return;
    if (!isParameterTracked(activeParamPath)) {
        trackedParameters[activeParamPath] = {
            lastValue: activeParam.get("value"),
            liveApiObject: activeParam
        };
    }
    var param = getOrCreateLockedParameterByPath(activeParamPath, targetMappingScene);
    param.targetValue = newValue;
    // log(activeScenes);
    updateActiveParametersForFader();
}
function handleSceneButton(buttonIndex, value) {
    mappingModeActive = value === 1;
    log("Mapping mode active: " + mappingModeActive);
    if (mappingModeActive) {
        targetMappingScene = activeScenes[buttonIndex];
        // for (var i = 0; i < targetMappingScene.lockedParameters.length; i++) {
        //   var lockedParameter = targetMappingScene.lockedParameters[i];
        //   trackedParameters[lockedParameter.path].liveApiObject.set(
        //     "value",
        //     lockedParameter.targetValue
        //   );
        // }
    }
    // TODO This resets it to the wrong value if the value is locked!
    if (!mappingModeActive) {
        for (var i = 0; i < targetMappingScene.lockedParameters.length; i++) {
            var lockedParameter = targetMappingScene.lockedParameters[i];
            var trackedParameter = trackedParameters[lockedParameter.path];
            trackedParameter.liveApiObject.set("value", trackedParameter.lastValue);
        }
    }
}
/********************
 * Crossfader logic *
 ********************/
var activeParametersForFader = {};
var activeParametersForFaderKeys = [];
function lerp(v0, v1, t) {
    return v0 * (1 - t) + v1 * t;
}
function updateActiveParametersForFader() {
    // TODO this can all be moved out
    for (var sceneIndex = 0; sceneIndex < 2; sceneIndex++) {
        // log(activeScenes[sceneIndex].lockedParameters);
        for (var paramIndex = 0; paramIndex < activeScenes[sceneIndex].lockedParameters.length; paramIndex++) {
            var param = activeScenes[sceneIndex].lockedParameters[paramIndex];
            if (!activeParametersForFader[param.path])
                activeParametersForFader[param.path] = {
                    targetValuesBySide: [undefined, undefined]
                };
            activeParametersForFader[param.path].targetValuesBySide[sceneIndex] =
                param.targetValue;
        }
    }
    activeParametersForFaderKeys = Object.keys(activeParametersForFader);
}
function handleCrossfader(amount) {
    crossfading = true;
    // var start = Date.now();
    for (var keyIndex = 0; keyIndex < activeParametersForFaderKeys.length; keyIndex++) {
        // var start = Date.now();
        var path = activeParametersForFaderKeys[keyIndex];
        var activeParam = activeParametersForFader[path];
        var values = [];
        for (var i = 0; i < 2; i++) {
            values[i] =
                activeParam.targetValuesBySide[i] !== undefined
                    ? activeParam.targetValuesBySide[i]
                    : trackedParameters[path].lastValue;
        }
        var value = lerp(values[0], values[1], amount);
        // log("after lerp: ", Date.now() - start);
        // var start2 = Date.now();
        // log(path, trackedParameters[path].liveApiObject.get("name"), value);
        trackedParameters[path].liveApiObject.set("value", value);
    }
    // log("after : ", Date.now() - start);
    crossfading = false;
}

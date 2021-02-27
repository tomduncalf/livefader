function log() {
  for (var i = 0, len = arguments.length; i < len; i++) {
    var message = arguments[i];
    if (message && message.toString) {
      var s = message.toString();
      if (s.indexOf("[object ") >= 0) {
        s = JSON.stringify(message);
      }
      post(s);
    } else if (message === null) {
      post("<null>");
    } else {
      post(message);
    }
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

var selectedTrackPath = "";
var selectedDevicePath = "";

var deviceListener = new LiveAPI(function (v) {
  log("deviceListener " + v);

  if (v[0] === "selected_device") {
    var device = getById(v[2]);
    selectedDevicePath = device.unquotedpath;
  }
});

function setupDeviceListener() {
  deviceListener.property = "selected_device";
  deviceListener.path = selectedTrackPath + " view";
}

var trackListener = new LiveAPI(function (v) {
  log("trackListener " + v);

  if (v[0] === "selected_track") {
    var track = getById(v[2]);
    selectedTrackPath = track.unquotedpath;
    setupDeviceListener();
  }
});
trackListener.property = "selected_track";
trackListener.path = "live_set view";

// var propertyListener = new LiveAPI(function (v) {
//   // log("param");

//   if (v[0] === "selected_parameter") {
//     selectedDeviceId = v[2];
//     var api = new LiveAPI();
//     api.id = Number(v[2]);
//     log(api.get("name"));
//   }
//   // log(v);
// });
// propertyListener.property = "selected_parameter";
// propertyListener.path = "live_set view";

// foo.path = "live_set view";
// foo.property = "selected_parameter";

// foo.path = "live_set view";
// foo.property = "selected_track";

// function callback(v) {
// log(new LiveAPI(v));
// log(v);
// }

// var liveObject = new LiveAPI();

// log("path:", liveObject.path);
// log("id:", liveObject.id);
// log("children:", liveObject.children);
// log(liveObject.info);

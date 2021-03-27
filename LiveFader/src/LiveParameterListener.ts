import { getLiveObjectById } from "./lib_maxForLiveUtils";
import { Log } from "./lib_maxUtils";

export class LiveParameterListener {
  // TODO could make it so this can turn itself on/off and have its own level
  log = new Log(this.constructor.name);

  private activeTrackPath = "";
  private activeDevicePath = "";
  private activeParameterPath = "";
  private activeParameter?: LiveAPIObject;

  private trackListener!: LiveAPI;
  private deviceListener!: LiveAPI;
  private parameterListener!: LiveAPI;
  private parmeterValueListener!: LiveAPI;

  constructor() {
    this.deviceListener = new LiveAPI((v: any[]) => {
      this.log.verbose("deviceListener " + v);

      if (v[0] === "selected_device") {
        var device = getLiveObjectById(v[2]);
        this.activeDevicePath = device.unquotedpath;
        this.log.verbose("deviceListener " + device.get("name"));
      }
    });

    this.trackListener = new LiveAPI((v: any[]) => {
      this.log.verbose("trackListener " + v);

      if (v[0] === "selected_track") {
        var track = getLiveObjectById(v[2]);
        this.activeTrackPath = track.unquotedpath;
        this.log.verbose("track " + track.get("name"));

        this.setupDeviceListener();
      }
    });
    this.trackListener.property = "selected_track";
    this.trackListener.path = "live_set view";
  }

  setupDeviceListener = () => {
    this.deviceListener.property = "selected_device";
    this.deviceListener.path = this.activeTrackPath + " view";
  };
}

//   var paramListener = new LiveAPI(function (v: any[]) {
//     // log("paramListener " + v);

//     if (v[0] === "selected_parameter" && v[2] > 0) {
//       activeParameter = getById(v[2]);
//       activeParameterPath = activeParameter.unquotedpath;
//       setupParamValueListener();
//       handleActiveParameterChanged();
//     }
//   });

//   function setupParamListener() {
//     paramListener.property = "selected_parameter";
//     paramListener.path = "live_set view";
//   }

//   setupParamListener();

//   var propertyValueListener = new LiveAPI(function (v: any[]) {
//     // log("propertyValueListener " + v);
//     handleActiveParameterValueChange(v[1]);
//   });

//   function setupParamValueListener() {
//     propertyValueListener.property = "value";
//     propertyValueListener.path = activeParameterPath;
//   }
// }

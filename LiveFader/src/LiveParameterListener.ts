import { getLiveObjectById } from "./lib_maxForLiveUtils";
import { Log } from "./lib_Log";

export class LiveParameterListener {
  log = new Log("LiveParameterListener");

  onActiveParameterChanged: (parameter: LiveAPIObject) => void = () => {};
  onActiveParameterValueChanged: (value: number) => void = () => {};

  private activeTrackPath = "";
  private activeDevicePath = "";
  private activeParameterPath = "";
  private activeParameter?: LiveAPIObject;

  private trackListener!: LiveAPI;
  private deviceListener!: LiveAPI;
  private parameterListener!: LiveAPI;
  private parameterValueListener!: LiveAPI;

  constructor() {
    this.setupParameterValueListener();
    this.setupParameterListener();
    this.setupDeviceListener();
    this.setupTrackListener();
  }

  setupParameterValueListener = () => {
    this.parameterValueListener = new LiveAPI((v: any[]) => {
      this.log.verbose("propertyValueListener " + v);
      this.onActiveParameterValueChanged(v[1]);
    });
  };

  resetParameterValueListener = () => {
    this.parameterValueListener.property = "value";
    this.parameterValueListener.path = this.activeParameterPath;
  };

  setupParameterListener = () => {
    this.parameterListener = new LiveAPI((v: any[]) => {
      this.log.verbose("parameterListener " + v);

      if (v[0] === "selected_parameter" && v[2] > 0) {
        this.activeParameter = getLiveObjectById(v[2]);
        this.activeParameterPath = this.activeParameter.unquotedpath;
        this.resetParameterValueListener();

        this.onActiveParameterChanged(this.activeParameter);
      }
    });
  };

  resetParameterListener = () => {
    this.parameterListener.property = "selected_parameter";
    this.parameterListener.path = "live_set view";
  };

  setupDeviceListener = () => {
    this.deviceListener = new LiveAPI((v: any[]) => {
      this.log.verbose("deviceListener " + v);

      if (v[0] === "selected_device") {
        var device = getLiveObjectById(v[2]);
        this.activeDevicePath = device.unquotedpath;
        this.resetParameterListener();

        this.log.verbose("deviceListener " + device.get("name"));
      }
    });
  };

  resetDeviceListener = () => {
    this.deviceListener.property = "selected_device";
    this.deviceListener.path = this.activeTrackPath + " view";
  };

  setupTrackListener = () => {
    this.trackListener = new LiveAPI((v: any[]) => {
      this.log.verbose("trackListener " + v);

      if (v[0] === "selected_track") {
        var track = getLiveObjectById(v[2]);
        this.activeTrackPath = track.unquotedpath;
        this.log.verbose("track " + track.get("name"));

        this.resetDeviceListener();
      }
    });
    this.trackListener.property = "selected_track";
    this.trackListener.path = "live_set view";
  };
}

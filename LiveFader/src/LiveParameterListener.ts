import { getLiveObjectById } from "./lib_maxForLiveUtils";
import { Log } from "./lib_Log";

/**
 * A LiveParameterListener listens for changes to the active track, active device,
 * active parameter and value of the active parameter in an Ableton Live set and
 * calls the corresponding onActive...Changed callback when one changes.
 */
export class LiveParameterListener {
  log = new Log("LiveParameterListener");

  onActiveParameterChanged: (parameter: LiveApiObject, device: LiveApiObject) => void = () => {};
  onActiveParameterValueChanged: (
    value: number,
    parameter: LiveApiObject,
    device: LiveApiObject
  ) => void = () => {};

  private activeDevice?: LiveApiObject;
  private activeParameter?: LiveApiObject;
  private activeDeviceIsSelf = false;

  private activeTrackPath = "";
  private activeDevicePath = "";
  private activeParameterPath = "";

  private trackListener!: LiveAPI;
  private deviceListener!: LiveAPI;
  private parameterListener!: LiveAPI;
  private parameterValueListener!: LiveAPI;

  constructor() {
    this.log.debug("constructor");

    this.setupParameterValueListener();
    this.setupParameterListener();
    this.setupDeviceListener();
    this.setupTrackListener();
  }

  setupParameterValueListener = () => {
    this.parameterValueListener = new LiveAPI((v: any[]) => {
      this.log.verbose("propertyValueListener " + v);

      if (!this.activeDeviceIsSelf)
        this.onActiveParameterValueChanged(v[1], this.activeParameter!, this.activeDevice!);
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

        if (!this.activeDeviceIsSelf)
          this.onActiveParameterChanged(this.activeParameter, this.activeDevice!);
      }
    });
  };

  // Seems like we need to reset this whenever the device changes
  resetParameterListener = () => {
    this.parameterListener.property = "selected_parameter";
    this.parameterListener.path = "live_set view";
  };

  setupDeviceListener = () => {
    this.deviceListener = new LiveAPI((v: any[]) => {
      this.log.verbose("deviceListener " + v);

      if (v[0] === "selected_device") {
        this.activeDevice = getLiveObjectById(v[2]);
        this.activeDevicePath = this.activeDevice.unquotedpath;
        this.resetParameterListener();

        const name = this.activeDevice.get<string>("name");
        this.activeDeviceIsSelf = name === "LiveFader"; // TODO must be a better way to do this

        this.log.verbose("deviceListener " + this.activeDevice.get("name"));
      }
    });
  };

  resetDeviceListener = () => {
    this.deviceListener.property = "selected_device";
    this.deviceListener.path = this.activeTrackPath + " view";
  };

  setupTrackListener = () => {
    this.trackListener = new LiveAPI((v: any[]) => {
      this.log.debug("trackListener " + v);

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

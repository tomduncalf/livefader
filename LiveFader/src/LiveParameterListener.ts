import { LiveApiDevice, LiveApiObjectWrapper, LiveApiParameter } from "./lib_maxForLiveUtils";
import { Log } from "./lib_Log";

/**
 * A LiveParameterListener listens for changes to the active track, active device,
 * active parameter and value of the active parameter in an Ableton Live set and
 * calls the corresponding onActive...Changed callback when one changes.
 */
export class LiveParameterListener {
  log = new Log("LiveParameterListener");

  onActiveParameterChanged: (parameter: LiveApiParameter, device: LiveApiDevice) => void = () => {};
  onActiveParameterValueChanged: (value: number, parameter: LiveApiParameter) => void = () => {};

  private activeDevice?: LiveApiDevice;
  private activeParameter?: LiveApiParameter;

  private activeTrackPath = "";
  private activeDevicePath = "";
  private activeDeviceName = "";
  private activeParameterPath = "";

  private trackListener!: LiveAPI;
  private deviceListener!: LiveAPI;
  private parameterListener!: LiveAPI;
  private parameterValueListener!: LiveAPI;

  constructor() {
    this.log.debug("LiveParameterListener constructed");

    this.setupParameterValueListener();
    this.setupParameterListener();
    this.setupDeviceListener();
    this.setupTrackListener();
  }

  // This should be called before reloading JS, otherwise listeners from previous loads persist.
  // See https://cycling74.com/forums/how-to-destroy-a-liveapi-object-instantiated-in-js
  removeListeners = () => {
    this.log.debug("Removing listeners");

    this.trackListener.property = "";
    this.deviceListener.property = "";
    this.parameterListener.property = "";
    this.parameterValueListener.property = "";
  };

  setupParameterValueListener = () => {
    this.parameterValueListener = new LiveAPI((v: any[]) => {
      if (!this.activeParameter!.device!.isLiveFaderDevice) {
        this.log.verbose(`propertyValueListener ${this.activeParameter!.device!.name}: ${v}`);
        this.onActiveParameterValueChanged(v[1], this.activeParameter!);
      }
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
        this.activeParameter = LiveApiParameter.get(v[2]);

        this.activeParameterPath = this.activeParameter.path;
        this.resetParameterValueListener();

        if (!this.activeDevice?.isLiveFaderDevice)
          this.onActiveParameterChanged(this.activeParameter, this.activeDevice!);
      }
    });
  };

  // Seems like we need to reset this whenever the device changes, maybe I am doing something wrong!
  resetParameterListener = () => {
    this.parameterListener.property = "selected_parameter";
    this.parameterListener.path = "live_set view";
  };

  setupDeviceListener = () => {
    this.deviceListener = new LiveAPI((v: any[]) => {
      this.log.verbose("deviceListener " + v);

      if (v[0] === "selected_device") {
        this.activeDevice = LiveApiDevice.get(v[2]);
        this.activeDevicePath = this.activeDevice.path;
        this.resetParameterListener();

        this.log.verbose("deviceListener " + this.activeDevice.name);
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
        var track = LiveApiObjectWrapper.get(v[2]);
        this.activeTrackPath = track.path;
        this.log.verbose("track " + track.name);

        this.resetDeviceListener();
      }
    });
    this.trackListener.property = "selected_track";
    this.trackListener.path = "live_set view";
  };
}

import { log, Log } from "./lib_Log";
import { lerp } from "./lib_math";
import { getLiveObjectById } from "./lib_maxForLiveUtils";
import { LiveParameterListener } from "./LiveParameterListener";
import { LockedParameter, ParameterScene, TrackedParameter } from "./models";

const CHAR_CODE_A = 65;

enum Inlets {
  LeftButton,
  RightButton,
  Fader,
  FullScreenButton,
}

enum State {
  Normal,
  Mapping,
  Crossfading,
}

interface ActiveLockedParameter {
  trackedParameter: TrackedParameter;
  lockedParameters: [LockedParameter?, LockedParameter?];
}

// Main entry point class which hooks everything together
export class LiveFader {
  log = new Log("LiveFader");
  patcher: any;

  state: State = State.Normal;

  scenes: ParameterScene[];
  activeScenes: ParameterScene[];

  // Keep a reference to the parameters which are locked by either of the current scenes
  // so we don't have to calculate this every time the crossfader changes
  activeLockedParameters: ActiveLockedParameter[] = [];

  // Keep track of every parameter which is locked in any scene, so we can quickly
  // access its LiveApiObject to set the value, and also so we can keep track of
  // the last value the user set it to so we know what value to return to
  trackedParametersById: Record<number, TrackedParameter> = {};

  liveParameterListener: LiveParameterListener = new LiveParameterListener();

  currentMappingScene?: ParameterScene = undefined;

  currentFaderValue = 0;
  lastFaderValue = 0;

  faderUpdateTask: Task;

  constructor() {
    log("LiveFader started");

    // Populate 8 scenes to start, named A to H
    this.scenes = [...new Array(8)].map(
      (_, i) => new ParameterScene(String.fromCharCode(CHAR_CODE_A + i))
    );

    this.activeScenes = [this.scenes[0], this.scenes[1]];

    this.liveParameterListener.onActiveParameterValueChanged = this.handleActiveParameterValueChanged;

    // Handle crossfader input at 30fps rather than continuosly to help with performance
    this.faderUpdateTask = new Task(this.updateFader, this);
    this.faderUpdateTask.interval = 1000 / 30;
    this.faderUpdateTask.repeat();
  }

  handleMessage = (inlet: Inlets, value: number) => {
    if (inlet === Inlets.LeftButton || inlet === Inlets.RightButton) {
      this.handleFaderButton(inlet, value);
    } else if (inlet === Inlets.FullScreenButton) {
      this.openFullScreen();
    } else if (inlet === Inlets.Fader) {
      this.handleFader(value);
    }
  };

  handleFader = (value: number) => {
    this.currentFaderValue = value;
  };

  updateFader = () => {
    if (this.currentFaderValue === this.lastFaderValue) return;

    this.handleFaderUpdate();
    this.lastFaderValue = this.currentFaderValue;
  };

  handleFaderUpdate = () => {
    const previousState = this.state;
    this.state = State.Crossfading;

    this.activeLockedParameters.forEach((activeLockedParameter) => {
      const values = [
        activeLockedParameter.lockedParameters[0]
          ? activeLockedParameter.lockedParameters[0].lockedValue
          : activeLockedParameter.trackedParameter.lastUserValue,
        activeLockedParameter.lockedParameters[1]
          ? activeLockedParameter.lockedParameters[1].lockedValue
          : activeLockedParameter.trackedParameter.lastUserValue,
      ];

      const newValue = lerp(values[0], values[1], this.currentFaderValue);

      activeLockedParameter.trackedParameter.apiObject.set("value", newValue);
    });

    this.state = previousState;
  };

  handleFaderButton = (inlet: Inlets, value: number) => {
    if (value === 0) {
      this.state = State.Normal;
      this.currentMappingScene = undefined;
    } else {
      this.state = State.Mapping;
      this.currentMappingScene = this.activeScenes[inlet === Inlets.LeftButton ? 0 : 1];
    }
  };

  handleActiveParameterValueChanged = (value: number) => {
    const parameter = this.liveParameterListener.activeParameter!;
    const parameterId = parameter.id;

    if (this.state === State.Normal) {
      if (this.trackedParametersById[parameterId] !== undefined) {
        this.trackedParametersById[parameterId].lastUserValue = value;

        this.log.verbose(`Updating last tracked value of parameter ${parameterId} to ${value}`);
      }
    } else if (this.state === State.Mapping) {
      if (!this.currentMappingScene!.isParameterLocked(parameter)) {
        this.currentMappingScene!.addLockedParameter(parameter, value);
        this.maybeAddTrackedParameter(parameter, value);
        this.updateActiveLockedParameters();
      } else {
        this.currentMappingScene!.lockedParametersById[parameterId].lockedValue = value;

        this.log.verbose(
          `Updating locked parameter ${parameterId} target to ${value} in scene ${
            this.currentMappingScene!.name
          }`
        );
      }
    } else if (this.state === State.Crossfading) {
      // Do nothing
    }
  };

  maybeAddTrackedParameter = (parameter: LiveApiObject, value: number) => {
    if (this.trackedParametersById[parameter.id] === undefined) {
      this.trackedParametersById[parameter.id] = new TrackedParameter(
        this.liveParameterListener.activeParameter!,
        value
      );

      this.log.debug(`Adding tracked parameter ${parameter.id} with value ${value}`);
    }
  };

  initialiseTrackedParameters = () => {
    this.trackedParametersById = {};

    this.scenes.forEach((scene) => {
      scene.forEachLockedParameter((lockedParameter) => {
        if (!this.trackedParametersById[lockedParameter.parameterId]) {
          const apiObject = getLiveObjectById(lockedParameter.parameterId);
          this.trackedParametersById[lockedParameter.parameterId] = new TrackedParameter(
            apiObject,
            apiObject.get("value")
          );
        }
      });
    });
  };

  updateActiveLockedParameters = () => {
    // Use a dictionary for easier construction of the array
    const activeLockedParametersObj: Record<number, ActiveLockedParameter> = {};

    this.activeScenes[0].forEachLockedParameter((lockedParameter) => {
      activeLockedParametersObj[lockedParameter.parameterId] = {
        trackedParameter: this.trackedParametersById[lockedParameter.parameterId],
        lockedParameters: [lockedParameter, undefined],
      };
    });

    this.activeScenes[1].forEachLockedParameter((lockedParameter) => {
      if (activeLockedParametersObj[lockedParameter.parameterId]) {
        activeLockedParametersObj[
          lockedParameter.parameterId
        ].lockedParameters[1] = lockedParameter;
      } else {
        activeLockedParametersObj[lockedParameter.parameterId] = {
          trackedParameter: this.trackedParametersById[lockedParameter.parameterId],
          lockedParameters: [undefined, lockedParameter],
        };
      }
    });

    this.log.verbose(activeLockedParametersObj);

    // Convert it to an array
    this.activeLockedParameters = Object.keys(activeLockedParametersObj).map(
      (k) => activeLockedParametersObj[k]
    );
  };

  openFullScreen = () => {
    this.patcher.message("script", "send", "window", "flags", "nomenu");
    this.patcher.message("script", "send", "window", "flags", "float");
    this.patcher.message("script", "send", "window", "exec");
    this.patcher.front();
  };
}

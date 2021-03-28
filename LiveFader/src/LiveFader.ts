import { Log } from "./lib_Log";
import { getLiveObjectById } from "./lib_maxForLiveUtils";
import { LiveParameterListener } from "./LiveParameterListener";
import { LockedParameter, ParameterScene, TrackedParameter, TrackedParameters } from "./models";

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

// Main entry point class which hooks everything together
export class LiveFader {
  log = new Log("LiveFader");
  patcher: any;

  state: State = State.Normal;

  scenes: ParameterScene[];
  activeScenes: ParameterScene[];

  // Keep a reference to the parameters which are locked by the current scenes
  // so we don't have to calculate this every time the crossfader changes
  // TODO is this useful?
  activeLockedParameters: [LockedParameter[], LockedParameter[]] = [[], []];

  // Keep track of every parameter which is locked in any scene, so we can quickly
  // access its LiveApiObject to set the value, and also so we can keep track of
  // the last value the user set it to so we know what value to return to
  trackedParametersById: Record<number, TrackedParameter> = {};

  liveParameterListener = new LiveParameterListener();

  currentMappingScene?: ParameterScene = undefined;

  constructor() {
    // Populate 8 scenes to start, named A to H
    this.scenes = [...new Array(8)].map(
      (_, i) => new ParameterScene(String.fromCharCode(CHAR_CODE_A + i))
    );

    this.activeScenes = [this.scenes[0], this.scenes[1]];

    this.liveParameterListener.onActiveParameterValueChanged = this.handleActiveParameterValueChanged;
  }

  handleMessage = (inlet: Inlets, value: number) => {
    if (inlet === Inlets.LeftButton || inlet === Inlets.RightButton) {
      this.handleFaderButton(inlet, value);
    } else if (inlet === Inlets.FullScreenButton) {
      this.openFullScreen();
    }
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
    const parameterId = this.liveParameterListener.activeParameter!.id;

    if (this.state === State.Normal) {
      if (this.trackedParametersById[parameterId] !== undefined) {
        this.log.verbose(`Updating last tracked value of parameter ${parameterId} to ${value}`);
        this.trackedParametersById[parameterId].lastUserValue = value;
      }
    } else if (this.state === State.Mapping) {
      if (this.currentMappingScene!.lockedParameters[parameterId] === undefined) {
        this.log.debug(
          `Adding locked parameter ${parameterId} with target ${value} to scene ${
            this.currentMappingScene!.name
          }`
        );

        this.currentMappingScene!.lockedParameters[parameterId] = new LockedParameter(
          parameterId,
          value
        );

        if (this.trackedParametersById[parameterId] === undefined) {
          this.log.debug(`Adding tracked parameter ${parameterId} with value ${value}`);

          this.trackedParametersById[parameterId] = new TrackedParameter(
            this.liveParameterListener.activeParameter!,
            value
          );
        }
      } else {
        this.log.verbose(
          `Update locked parameter ${parameterId} target to ${value} in scene ${
            this.currentMappingScene!.name
          }`
        );
        this.currentMappingScene!.lockedParameters[parameterId].lockedValue = value;
      }
    } else if (this.state === State.Crossfading) {
      // Do nothing
    }
  };

  initialiseTrackedParameters = () => {
    this.trackedParametersById = {};

    this.scenes.forEach((scene) => {
      scene.lockedParameters.forEach((lockedParameter) => {
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

  openFullScreen = () => {
    this.patcher.message("script", "send", "window", "flags", "nomenu");
    this.patcher.message("script", "send", "window", "flags", "float");
    this.patcher.message("script", "send", "window", "exec");
    this.patcher.front();
  };
}

import { Log } from "./lib_Log";
import { LiveParameterListener } from "./LiveParameterListener";
import { LockedParameter, ParameterScene, TrackedParameters } from "./models";

const CHAR_CODE_A = 65;

enum Inlets {
  LeftButton,
  RightButton,
  Fader,
  FullScreenButton,
}

// Main entry point class which hooks everything together
export class LiveFader {
  log = new Log("LiveFader");

  scenes: ParameterScene[];
  activeScenes: ParameterScene[];

  // Keep a reference to the parameters which are locked by the current scenes
  // so we don't have to calculate this every time the crossfader changes
  activeLockedParameters: [LockedParameter[], LockedParameter[]] = [[], []];

  // Keep track of every parameter which is locked in any scene, so we can quickly
  // access its LiveApiObject to set the value, and also so we can keep track of
  // the last value the user set it to so we know what value to return to
  trackedParameters = new TrackedParameters();

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
      if (value === 0) {
        this.currentMappingScene = undefined;
      } else {
        this.currentMappingScene = this.activeScenes[
          inlet === Inlets.LeftButton ? 0 : 1
        ];
      }
    }
  };

  handleActiveParameterValueChanged = (value: number) => {
    this.log.verbose("handleActiveParameterValueChanged", value);

    if (this.currentMappingScene === undefined) return;

    this.log.verbose("handleActiveParameterValueChanged 2", value);
  };
}

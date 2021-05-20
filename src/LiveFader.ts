import { log, Log } from "./lib_Log";
import { lerp } from "./lib_math";
import { LiveApiParameter } from "./lib_maxForLiveUtils";
import { LiveParameterListener } from "./LiveParameterListener";
import {
  LockedParameter,
  ParameterScene,
  SavedLockedParameter,
  SavedState,
  TrackedParameter,
} from "./models";

const CHAR_CODE_A = 65;

interface InletOutlet {
  index: number;
  description: string;
}

export const Inlets = {
  LeftButton: { index: 0, description: "Left Button" },
  RightButton: { index: 1, description: "Right Button" },
  Fader: { index: 2, description: "Fader" },
  SceneButtons: { index: 3, description: "Scene Buttons (via funnel)" },
};

export const Outlets = {
  Debug: { index: 0, description: "Debug" },
  LeftText: { index: 1, description: "Left Text" },
  RightText: { index: 2, description: "Right Text" },
  LeftButton: { index: 3, description: "Left Button" },
  RightButton: { index: 4, description: "Right Button" },
  SceneButtons: { index: 5, description: "Scene Buttons (via route)" },
};

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

  scenes!: ParameterScene[];
  activeScenes!: ParameterScene[];
  activeSceneIndices!: [number, number];
  activeSceneButtonIndex?: number;

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

    this.reset();

    this.liveParameterListener.onActiveParameterValueChanged =
      this.handleActiveParameterValueChanged;

    // Handle crossfader input at 30fps rather than continuosly to help with performance
    this.faderUpdateTask = new Task(this.updateFader, this);
    this.faderUpdateTask.interval = 1000 / 30;
    this.faderUpdateTask.repeat();
  }

  cleanup = () => {
    this.liveParameterListener.removeListeners();
  };

  reset = () => {
    this.log.debug("reset");

    // Populate 8 scenes to start, named A to H
    this.scenes = [...new Array(8)].map(
      (_, i) => new ParameterScene(String.fromCharCode(CHAR_CODE_A + i))
    );

    this.activeScenes = [this.scenes[0], this.scenes[1]];
    this.activeSceneIndices = [0, 1];

    this.updateActiveLockedParameters();
    this.updateFader(true);
    this.updateUI();
  };

  resetScene = () => {
    this.log.debug("reset scene");

    if (this.currentMappingScene) {
      this.currentMappingScene.reset();
      this.updateActiveLockedParameters();
      this.updateFader(true);
      this.updateUI();
    }
  };

  handleMessage = (inlet: number, value: number) => {
    if (inlet === Inlets.LeftButton.index || inlet === Inlets.RightButton.index) {
      this.handleFaderButton(inlet, value);
    } else if (inlet === Inlets.Fader.index) {
      this.handleFader(value);
    }
  };

  handleFader = (value: number) => {
    this.currentFaderValue = value;
  };

  setState = (state: State) => {
    // this.log.verbose(`Entering state ${state}`);
    this.state = state;
  };

  updateFader = (force = false) => {
    if (!force && this.currentFaderValue === this.lastFaderValue) return;

    this.log.verbose(`Update fader to ${this.currentFaderValue}`);

    this.handleFaderUpdate();
    this.lastFaderValue = this.currentFaderValue;
  };

  handleFaderUpdate = () => {
    const previousState = this.state;
    this.setState(State.Crossfading);

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

      activeLockedParameter.trackedParameter.parameter.setValue(newValue);
    });

    this.setState(previousState);
  };

  handleFaderButton = (inlet: number, value: number) => {
    if (value === 0) {
      this.log.debug(`Enter normal mode`);

      const wasMapping = this.state === State.Mapping;
      this.setState(State.Normal);
      this.activeSceneButtonIndex = undefined;

      if (wasMapping) {
        this.updateFader(true);
      }

      this.currentMappingScene = undefined;
    } else {
      this.log.debug(
        `Enter mapping mode for ${inlet === Inlets.LeftButton.index ? "left" : "right"} scene`
      );

      this.setState(State.Mapping);

      const buttonIndex = inlet === Inlets.LeftButton.index ? 0 : 1;
      this.currentMappingScene = this.activeScenes[buttonIndex];
      this.activeSceneButtonIndex = buttonIndex;

      outlet(
        inlet === Inlets.LeftButton.index ? Outlets.RightButton.index : Outlets.LeftButton.index,
        "set",
        0
      );
    }

    this.updateUI();
  };

  handleActiveParameterValueChanged = (value: number, parameter: LiveApiParameter) => {
    if (this.state === State.Normal) {
      if (this.trackedParametersById[parameter.id] !== undefined) {
        this.trackedParametersById[parameter.id].lastUserValue = value;

        this.log.verbose(
          `Updating last tracked value of parameter ${parameter.id} (${parameter.name}) to ${value}`
        );
      }
    } else if (this.state === State.Mapping) {
      if (!this.currentMappingScene!.isParameterLocked(parameter)) {
        this.currentMappingScene!.addLockedParameter(parameter, value);
        this.maybeAddTrackedParameter(parameter, value);
        this.updateActiveLockedParameters();
      } else {
        this.currentMappingScene!.lockedParametersById[parameter.id].lockedValue = value;

        this.log.verbose(
          `Updating locked parameter ${parameter.name} ${
            parameter.id
          } target to ${value} in scene ${this.currentMappingScene!.name}`
        );

        // this.log.debug(this.scenes);
      }

      this.updateUI();
      notifyclients();
    } else if (this.state === State.Crossfading) {
      // Do nothing
    }
  };

  maybeAddTrackedParameter = (parameter: LiveApiParameter, value: number) => {
    if (this.trackedParametersById[parameter.id] === undefined) {
      this.trackedParametersById[parameter.id] = new TrackedParameter(parameter, value);

      this.log.debug(`Adding tracked parameter ${parameter.id} with value ${value}`);
    }
  };

  initialiseTrackedParameters = () => {
    this.trackedParametersById = {};

    this.scenes.forEach((scene) => {
      scene.forEachLockedParameter((lockedParameter) => {
        if (!this.trackedParametersById[lockedParameter.parameter.id]) {
          this.trackedParametersById[lockedParameter.parameter.id] = new TrackedParameter(
            lockedParameter.parameter,
            lockedParameter.parameter.value
          );
        }
      });
    });
  };

  updateActiveLockedParameters = () => {
    const previousLockedParmeters = [...this.activeLockedParameters];

    // Use a dictionary for easier construction of the array
    const activeLockedParametersObj: Record<number, ActiveLockedParameter> = {};

    this.activeScenes[0].forEachLockedParameter((lockedParameter) => {
      activeLockedParametersObj[lockedParameter.parameter.id] = {
        trackedParameter: this.trackedParametersById[lockedParameter.parameter.id],
        lockedParameters: [lockedParameter, undefined],
      };
    });

    this.activeScenes[1].forEachLockedParameter((lockedParameter) => {
      if (activeLockedParametersObj[lockedParameter.parameter.id]) {
        activeLockedParametersObj[lockedParameter.parameter.id].lockedParameters[1] =
          lockedParameter;
      } else {
        activeLockedParametersObj[lockedParameter.parameter.id] = {
          trackedParameter: this.trackedParametersById[lockedParameter.parameter.id],
          lockedParameters: [undefined, lockedParameter],
        };
      }
    });

    this.log.verbose(activeLockedParametersObj);

    // Convert it to an array
    this.activeLockedParameters = Object.keys(activeLockedParametersObj).map(
      (k) => activeLockedParametersObj[Number(k)]
    );

    // Reset any parameters not in either scene to their last tracked value
    const lastState = this.state;
    this.setState(State.Crossfading);

    for (let parameter of previousLockedParmeters) {
      if (!activeLockedParametersObj[parameter.trackedParameter.parameter.id]) {
        parameter.trackedParameter.resetToLastUserValue();
      }
    }

    this.setState(lastState);
  };

  updateUI = () => {
    outlet(Outlets.LeftText.index, "set", this.activeScenes[0].getDescription());
    outlet(Outlets.RightText.index, "set", this.activeScenes[1].getDescription());

    this.setAllSceneButtonsOff();
    if (this.activeSceneButtonIndex !== undefined)
      this.setSceneButton(this.activeSceneIndices[this.activeSceneButtonIndex], true);
  };

  openPopout = () => {
    this.patcher.message("script", "send", "window", "flags", "nomenu");
    this.patcher.message("script", "send", "window", "flags", "float");
    this.patcher.message("script", "send", "window", "exec");
    this.patcher.front();
  };

  handleSceneButton = (sceneIndex: number, state: boolean) => {
    if (this.activeSceneButtonIndex === undefined) {
      this.setAllSceneButtonsOff();
      return;
    }

    if (state) {
      this.setActiveScene(this.activeSceneButtonIndex, sceneIndex);
      this.currentMappingScene = this.scenes[sceneIndex];
    }

    this.updateUI();
  };

  setActiveScene = (buttonIndex: number, sceneIndex: number) => {
    this.activeScenes[buttonIndex] = this.scenes[sceneIndex];
    this.activeSceneIndices[buttonIndex] = sceneIndex;

    // Need to reset unlocked parameters here
    this.updateActiveLockedParameters();
    this.updateFader(true);
    this.updateUI();
  };

  setSceneButton = (sceneIndex: number, state: boolean) => {
    outlet(Outlets.SceneButtons.index, sceneIndex, "set", state ? 1 : 0);
  };

  setAllSceneButtonsOff = () => {
    for (let i = 0; i < 8; i++) this.setSceneButton(i, false);
  };

  getSavedState = () => {
    const state: SavedState = {
      scenes: this.scenes.map((scene) => ({
        name: scene.name,
        description: scene.description,
        lockedParameters: Object.keys(scene.lockedParametersById).map((k) => {
          const lockedParameter = scene.lockedParametersById[k as any];

          return {
            path: lockedParameter.parameter.path,
            lockedValue: lockedParameter.lockedValue,
          } as SavedLockedParameter;
        }),
      })),
      activeSceneIndices: this.activeSceneIndices,
    };

    return state;
  };

  dumpSavedState = () => {
    this.log.debug(this.getSavedState());
  };

  loadSavedState = (savedState: string) => {
    this.log.debug(`loadSavedState: ${savedState}`);
    const parsed: SavedState = JSON.parse(savedState);

    this.scenes = parsed.scenes.map((s) => ParameterScene.hydrateFromSavedState(s));
    this.activeScenes = [
      this.scenes[parsed.activeSceneIndices[0]],
      this.scenes[parsed.activeSceneIndices[1]],
    ];

    this.initialiseTrackedParameters();
    this.updateActiveLockedParameters();
    this.updateUI();
  };
}

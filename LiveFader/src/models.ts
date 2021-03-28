import { log } from "./lib_Log";

class LockedParameter {
  constructor(public parameterId: number, public lockedValue: number) {}
}

class ParameterScene {
  description: string = "";
  lockedParameters: LockedParameter[] = [];

  constructor(public name: string) {}
}

class TrackedParameter {
  constructor(public apiObject: LiveApiObject, public lastUserValue: number) {}
}

// Keep track of every parameter which is locked in any scene, so we can quickly
// access its LiveApiObject to set the value, and also so we can keep track of
// the last value the user set it to so we know what value to return to
class TrackedParameters {
  private trackedParametersById: Record<number, TrackedParameter> = {};

  isParameterTracked = (id: number) => {
    return this.trackedParametersById[id] !== undefined;
  };

  updateTrackedParameterValue = (id: number, value: number) => {
    if (this.isParameterTracked(id))
      this.trackedParametersById[id].lastUserValue = value;
  };
}

const CHAR_CODE_A = 65;

// Application state which we want to persist
export class State {
  scenes: ParameterScene[];
  activeScenes: ParameterScene[];

  constructor() {
    // Populate 8 scenes to start, named A to H
    this.scenes = [...new Array(8)].map(
      (_, i) => new ParameterScene(String.fromCharCode(CHAR_CODE_A + i))
    );

    this.activeScenes = [this.scenes[0], this.scenes[1]];
  }
}

// Temporary state which we will recreate each time
export class TemporaryState {
  // Keep a reference to the parameters which are locked by the current scenes
  // so we don't have to calculate this every time the crossfader changes
  activeLockedParameters: [LockedParameter[], LockedParameter[]] = [[], []];

  trackedParameters = new TrackedParameters();
}

// State of inputs
export class InputState {}

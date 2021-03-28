import { LiveParameterListener } from "./LiveParameterListener";
import { State } from "./models";

// Main entry point class which hooks everything together
export class LiveFader {
  state = new State();
  liveParameterListener = new LiveParameterListener();

  constructor() {}
}

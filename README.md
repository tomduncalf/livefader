# LiveFader

LiveFader is a Max for Live device, implementing a parameter cross-fader in the style of the Elektron Octatrack.

Each side of the cross-fader is assigned to a "scene", and each scene can contain locked values for as many parameters as you like from anywhere in your Live set. As you move the fader from one side to the other, any locked parameters will fade their values, allowing interesting transitions to be easily created.

LiveFader is written entirely in TypeScript, showcasing the potential of the Max Javascript API for creating advanced functionality. My plan is to split this Max/TS integration out into a reusable module – for now, I have [documented](#Working-with-TypeScript-in-Max) how the integration code works and some of the gotchas below.

Quick video demo:

https://user-images.githubusercontent.com/5458070/118831687-e2e33880-b8b7-11eb-9422-063d0ac86f4e.mp4

## Status

Work in progress: basic functionality works but there are some bugs and features missing - see [TODO](#TODO).

## Requirements

- Ableton Live 11 Suite with Max for Live installed

For development:

- Node.js (I recommend installing it with https://github.com/nvm-sh/nvm to allow multiple versions to co-exist)

## Usage

To use, open `LiveFader.amxd` in Ableton (e.g. drag it in to a track). This will create an instance of LiveFader on a track - you should probably only use one instance in a set.

The below diagram provides a quick overview of the main UI elements:

![Overview of LiveFader UI elements](https://user-images.githubusercontent.com/5458070/119034250-11d7d800-b9a6-11eb-844d-3e576eb64156.png)

All controls are MIDI mappable using Live's usual MIDI mapping (Cmd-M), so you can assign buttons on a controller to the left/right buttons and assign a fader or rotary to the crossfader.

The easiest way to work with LiveFader is to first click "popout" and position its window so that you can always see it - this makes it easier to see what is going on.

The main workflow is:

1. Press either the left or right cross-fader button to enter "mapping" mode and select which side you want to assign a locked parameter value to.

2. Drag the parameter you want to lock to the value you want it to be locked to. You should see the parameter track, name and value displayed in the text area under the scene buttons (some parameters do not register, e.g. the visual wavetable display in Wavetable - in that particular case, you can use the slider to the side).

3. Repeat for any other parameters you want to lock.

4. Press the same cross-fader button again. The parameters will reset to their previous value before you entered "mapping" mode.

5. Now when you drag the cross-fader, the locked parameters will transition between either their current value (if they are only locked on one side of the fader) or between the two locked values (if they are locked on both sides of the fader).

You can use the scene buttons to choose a different scene for either the left or right side of the fader (when that side's mapping button is active), allowing you to have up to 8 different sets of locked parameters available.

Right now, the only way to remove a parameter lock is to hit "reset_scene" - I plan to add the ability to remove individual parameters.

## Development

### Pre-requisites

To develop the Max device, you need to add the `dist` directory from this repo (which contains the compiled JS) to Max's list of search paths – there is no way to point it a specific directory otherwise, and putting the build files in the top level directory gets cluttered.

Load `LiveFader Dev.amxd` in Ableton, open up the Max editor and go to `Options` > `File Preferences` and add a path pointing to the `dist` directory inside wherever you cloned this repo.

After doing this, don't save any changes to the Max file (or undo them if you have already), as it can result in all the outlets and inlets disconnecting in the patch if it couldn't find the JS files (see [below](#Working-with-TypeScript-in-Max) for explanation).

### Running

1. In a terminal, run `yarn dev`. This will watch the source TypeScript files for changes, and when a change occurs, will rebuild the JS code.

2. Open `LiveFader Dev.amxd` in Ableton. It should be working correctly.

3. As you make changes to the code, you need to manually trigger a reload of the JS (using Max's autowatcher results in listeners being left dangling, see [below](#Working-with-TypeScript-in-Max)). To do this, open up the Max editor and cmd-click (in edit mode, or single click in presentation mode) the `bang` commented with `hit to reload js`. This will ensure that all listeners are cleaned up and that the JS reloads properly.

   Generally, I find it is useful to have the Max window open when working on the code as you can see the log output in the console. However, if you want to develop with Max closed, the easiest way is to click `popout` to open the LiveFader window and then resize it so that you can see the `bang` button and the console output (which gets appended to a comment box).

### Distributing

To create a distributable frozen `amxd`:

1. In the Max editor, click "Show containing project" in the footer icon bar (looks like a graph of square nodes) and check that the list of files under `Code` matches those in the `dist` directory – this tells Max to bundle these files into the `amxd`. You should only need to do this if a new source file has been added.

2. Click the freeze icon in the footer icon bar.

3. Save the frozen patch to a different filename than the dev version (e.g. `LiveFader.amxd`)

   Do not "unfreeze" this frozen patch, as it will extract the Javascript files from the frozen patch into Max's own folder and they'll take precidence over your source files, leading to hours of confusion (trust me, I know...)!

   If you do this by accident, you need to go to `~/Documents/Max8/Max For Live Devices/` and delete any `LiveFader` related directories to clear it out.

## Working with TypeScript in Max

Max has somewhat basic Javascript support, but I've made an effort to make working with it feel as "modern" as possible, using some abstractions and TypeScript (thanks https://github.com/ErnstHot/TypeScript-for-Max for the type definitions which I have reused).

A few of the features I've created which might be useful to others (I plan to split these out into a reusable module of some kind at some point):

- A [wrapper](https://github.com/tomduncalf/livefader/blob/master/src/lib_maxForLiveUtils.ts) for LiveAPI objects and some helpers for retrieving objects by ID etc., to make working with them easier.

- A [LiveApiParameterListener](https://github.com/tomduncalf/livefader/blob/master/src/LiveParameterListener.ts) class which can listen for changes to the active parameter in the Live UI, so you can respond to any actions the user takes in their set.

- A [Log](https://github.com/tomduncalf/livefader/blob/master/src/lib_Log.ts) class, which can output to the Max console and also to a comment box (if you want to be able to see logs when not running the Max editor). The log can be [configured](https://github.com/tomduncalf/livefader/blob/master/src/config_log.ts) so each module has its own verbosity settings, which can help when debugging complicated interactions.

- The [main entry point](https://github.com/tomduncalf/livefader/blob/master/src/main.ts) for LiveFader should serve as a useful template for other projects.

- In general, the [LiveFader](https://github.com/tomduncalf/livefader/blob/master/src/LiveFader.ts) class shows how to interact with the Max for Live API in a modern and predictable manner.

### Limitations

There are numerous limitations in Max's Javascript support. I've tried as best I can to work around them, but there are some you need to be aware of:

- Max's JS engine supports somewhere between ES3 and ES5 Javascript. Generally, it is better to keep it simple rather than using "cutting edge" functionality, as even if it can be polyfilled by TypeScript, it might impact performance.

- Source files cannot be required from subdirectories, only from the top level. For that reason, I've "namespaced" the files by prefixing them with what their directory name would be.

- Beware of leaking listeners when developing – Max will not remove any LiveAPI listeners if you just reload the script, leading to eventual slowdown and bugs. For this reason, use the `bang` in the Max editor to reload the project after a change, which first calls a `cleanup()` function and ensures the initialisation order is correct.

- If you cause a compiler error, you can sometimes end up losing all your inlet/outlet connections (because the main JS file dictates the number of connections). You'll know about it because everything stops working! Keep an eye out for this – it's usually easiest to just revert the Max file, but you can fix it up manually as each outlet/inlet is labelled.

# TODO

- [ ] Add UI for removing parameters from the mapping - right now you can only reset the whole thing
- [ ] Testing
- [ ] Fix various bugs
- [ ] Better UI including remove parameter
- [ ] Split out reusable code to a separate module

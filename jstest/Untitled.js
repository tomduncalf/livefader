inlets = 1
outlets = 1

function bang() {
	outlet(0, "set", "LOADED " + new Date().toString());
}
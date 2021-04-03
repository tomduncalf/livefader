autowatch = 1

inlets = 1
outlets = 1

post("hello");

value = 0;

function msg_int(v) {
	value = v;
	update();
}

function update() {
	outlet(0, value);
	notifyclients();
}

/*declareattribute("value", "getValue", "setValue");

function setValue(v) {
	post("setValue", v);
	value = v;
	update();
}

function getValue() {
	post("getValue", value);
	return value;
}*/

function getvalueof() {
	post("getvalueof");
	return value;
}

function setvalueof(v) {
	post("setvalueof", v);
	value = v;
	update();
}
	
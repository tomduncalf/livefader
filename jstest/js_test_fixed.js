var myJsVar1 = 0
declareattribute("myJsVar1", "getmyJsVar1", "setmyJsVar1")
function getmyJsVar1 () { return myJsVar1 }
function setmyJsVar1 (val) {
    myJsVar1 = val
}
var myJsVar2 = 0
declareattribute("myJsVar2")
function outputmyVars() {
    outlet (0, 1, myJsVar1)
    outlet (0, 2, myJsVar2)
}
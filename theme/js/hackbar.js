/**
Create a panel, and add listeners for panel show/hide events.
*/
var namespace = chrome;
try{
	namespace.devtools.panels.create(
		"HackBar",
		"/icons/icon.png",
		"/theme/hackbar-panel.html"
	);
}catch(e){
	console.log(e);
}

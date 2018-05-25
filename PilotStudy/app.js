"use strict";

var currAngle = 0;
var documentsDir, dataFile;
var participantId = 1;

function log(data) {
	if (dataFile !== null) {
		dataFile.openStream("a", function(fs) {
			fs.write(data.timestamp + "," + data.type + "," + data.x + "," + data.y + "," + data.angle + "\n");
			fs.close();
		}, function(e) {
			console.log("Error " + e.message);
		}, "UTF-8");
	}
}

function rotaryEventHandler(event) {
	var direction = event.detail.direction;
	var data;

	if (direction === "CW") {
		currAngle += 15;
		data = {
			timestamp : Date.now(),
			type : "rotary",
			x : 0,
			y : 0,
			angle : currAngle
		};
		log(data);
		console.log("timestamp: " + Date.now() + " type: " + "rotary" + " current angle: " + currAngle);
	} else if (direction === "CCW") {
		currAngle -= 15;
		data = {
			timestamp : Date.now(),
			type : "rotary",
			x : 0,
			y : 0,
			angle : currAngle
		};
		log(data);
		console.log("timestamp: " + Date.now() + " type: " + "rotary" + " current angle: " + currAngle);
	}
}

function touchstartEventHandler(event) {
	var target = event.touches.item(0);
	var data = {
		timestamp : Date.now(),
		type : event.type,
		x : target.clientX,
		y : target.clientY,
		angle : 0
	};
	log(data);
	console.log("timestamp: " + Date.now() + " type: " + event.type + " x: " + target.clientX + " y: " + target.clientY);
}

function touchendEventHandler(event) {
	var target = event.changedTouches.item(0);
	var data = {
		timestamp : Date.now(),
		type : event.type,
		x : target.clientX,
		y : target.clientY,
		angle : 0
	};
	log(data);
	console.log("timestamp: " + Date.now() + " type: " + event.type + " x: " + target.clientX + " y: " + target.clientY);
}

function touchcancelEventHandler(event) {
	var target = event.touches.item(0);
	var data = {
		timestamp : Date.now(),
		type : event.type,
		x : target.clientX,
		y : target.clientY,
		angle : 0
	};
	log(data);
	console.log("timestamp: " + Date.now() + " type: " + event.type + " x: " + target.clientX + " y: " + target.clientY);
}

function touchmoveEventHandler(event) {
	var target = event.touches.item(0);
	var data = {
		timestamp : Date.now(),
		type : event.type,
		x : target.clientX,
		y : target.clientY,
		angle : 0
	};
	log(data);
	console.log("timestamp: " + Date.now() + " type: " + event.type + " x: " + target.clientX + " y: " + target.clientY);
}

window.onload = function() {
	tizen.filesystem.resolve('documents', function(result) {
		documentsDir = result;
		dataFile = documentsDir.createFile('participant' + participantId + '.csv');
		if (dataFile !== null) {
			dataFile.openStream("w", function(fs) {
				fs.write("timestamp,type,x,y,angle\n");
				fs.close();
			}, function(e) {
				console.log("Error " + e.message);
			}, "UTF-8");
		}
	});

	window.addEventListener("tizenhwkey", function(ev) {
		var activePopup = null, page = null, pageid = "";

		if (ev.keyName === "back") {
			activePopup = document.querySelector(".ui-popup-active");
			page = document.getElementsByClassName("ui-page-active")[0];
			pageid = page ? page.id : "";

			if (pageid === "main" && !activePopup) {
				try {
					tizen.application.getCurrentApplication().exit();
				} catch (ignore) {
				}
			} else {
				window.history.back();
			}
		}
	});
	window.addEventListener("rotarydetent", rotaryEventHandler);
	window.addEventListener("touchstart", touchstartEventHandler);
	window.addEventListener("touchend", touchendEventHandler);
	window.addEventListener("touchmove", touchmoveEventHandler);
	window.addEventListener("touchcancel", touchcancelEventHandler);
};
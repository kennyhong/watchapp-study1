"use strict";

var currAngle = 0;
var currTrial = 1;
var conditions = [];
var documentsDir, dataFile;
var participantId = 1;
var state;

function log(data) {
	if (dataFile !== null) {
		dataFile.openStream("a", function(fs) {
			fs.write(data.timestamp + "," + participantId + "," + currTrial + "," + conditions[currTrial] + "," + data.type + "," + data.x + "," +
					 data.y + "," + data.angle + "\n");
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
	console.log("timestamp: " + Date.now() + " type: " + event.type + " x: "
			+ target.clientX + " y: " + target.clientY);
	toggleTrial();
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

function toggleTrial() {
	if (state.innerHTML === "Start") {
		currAngle = 0;
		window.addEventListener("rotarydetent", rotaryEventHandler);
		state.innerHTML = "Stop";
	} else if (state.innerHTML === "Stop") {
		window.removeEventListener("rotarydetent", rotaryEventHandler);
		if(currTrial < conditions.length - 1) {
			state.innerHTML = "Start";
			currTrial++;
		} else {
			state.innerHTML = "Complete"
		}
	}
}

function deleteFile(file) {
	if(documentsDir){
		documentsDir.deleteFile(file.fullPath, function() {
			console.log("Save File Deleted");
		}, function(error) {
			console.log(JSON.stringify(error));
		});
	}
}

function saveParticipant() {
	var nextId = participantId + 1;
	var data = {
			participant: nextId
	};
	console.log(JSON.stringify(data));
	var newSave = documentsDir.createFile('study.txt');
	if (newSave !== null) {
		newSave.openStream("w", function(fs) {
			fs.write(JSON.stringify(data));
			fs.close();
		}, function(e) {
			console.log("Error " + e.message);
		}, "UTF-8");
	}
}

function setupStudy() {
	var studySaveFile;
	var saveContent;
	tizen.filesystem.resolve('documents', function(result) {
		documentsDir = result;
		studySaveFile = documentsDir.resolve('study.txt');
		if (studySaveFile) {
			studySaveFile.openStream('r', 
			function(stream) {
				
				var studyInfo;
				var studyCSVContent;
				// Grab Next Participant Number
				var saveJson;
				stream.position = 0;
				saveContent = stream.read(stream.bytesAvailable);
				saveJson = JSON.parse(saveContent);
				console.log("Next Participant: " + saveJson.participant);
				participantId = saveJson.participant;
				console.log(participantId);
				
				//create new csv
				dataFile = documentsDir.createFile('participant' + participantId
						+ '.csv');
				if (dataFile !== null) {
					dataFile.openStream("w", function(fs) {
						fs.write("timestamp,participant_id,trial_number,condition,type,x,y,angle\n");
						fs.close();
					}, function(e) {
						console.log("Error " + e.message);
					}, "UTF-8");
				}
				
				//load study
				studyInfo = documentsDir.resolve('studyP'+participantId+'.csv');
				if (studyInfo) {
					studyInfo.openStream('r', function(stream){
						studyCSVContent = stream.read(stream.bytesAvailable);
						console.log(studyCSVContent);
						var splitContent = studyCSVContent.split("\n");
						for (var i = 0; i < splitContent.length - 1; i++) {
							conditions[i] = splitContent[i].split(",")[1].replace(/(\r\n|\n|\r)/gm,"");
						}
						console.log(conditions);
					});
				}
				
				//Delete Save File
				deleteFile(studySaveFile);
				
				//Save Next Participant
				saveParticipant();
				
				state.innerHTML = "Start";
			},
			function(error) {
				console.log(JSON.stringify(error));
			}
			);
		}
	});
}

window.onload = function() {
	state = document.getElementById("trial-state");
	setupStudy();
	window.addEventListener("touchstart", touchstartEventHandler);
	window.addEventListener("touchend", touchendEventHandler);
	window.addEventListener("touchmove", touchmoveEventHandler);
	window.addEventListener("touchcancel", touchcancelEventHandler);
};

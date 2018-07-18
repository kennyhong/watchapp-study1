"use strict";

var currAngle = 0;
var currTrial = 1;
var conditions = [];
var documentsDir, dataFile, eventsFile;
var isMenuVisable = true;
var participantId = 1;
var state;
var currCondition;
var currDate = Date.now();
var ss_num = 0;
var ss_menus;
var imgPaths = ['icons/images/apple.png', 'icons/images/cat.png', 'icons/images/zebra.png', 'icons/images/printer.png',
                 'icons/images/paperclip.png', 'icons/images/carrot.png','icons/images/pineapple.png', 'icons/images/penguin.png'];
var inTrial = false;
var motorRotationConditions = [1,2,3];
var motorRotationCount = 0;
var displayConditions = [(Math.PI / 12), (Math.PI / 6), (Math.PI / 4)];
var rotationCount = -1;

var turnRight = false;

var targetImagePaths = ['icons/images/apple.png', 'icons/images/cat.png', 'icons/images/zebra.png', 'icons/images/printer.png',
                        'icons/images/paperclip.png', 'icons/images/carrot.png','icons/images/pineapple.png', 'icons/images/penguin.png'];
var currTarget = -1;

var errId = 0;

function setupStudy() {
	var studySaveFile;
	var saveContent;
	tizen.filesystem
			.resolve(
					'documents',
					function(result) {
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
				
				//create new data csv
				dataFile = documentsDir.createFile('participant' + participantId
						+ '.csv');
				if (dataFile !== null) {
					dataFile.openStream("w", function(fs) {
						fs.write("log_type,timestamp,participant_id,trial_number,motor_condition,display_condition,menu_condition,current_selection,target_selection,event_type,x,y,angle\n");
						fs.close();
					}, function(e) {
						console.log("Error " + e.message);
					}, "UTF-8");
				}
				
				//create new events csv
				eventsFile = documentsDir.createFile('events_participant' + participantId
						+ '.csv');
				if (eventsFile !== null) {
					eventsFile.openStream("w", function(fs) {
						fs.write("log_type,timestamp,participant_id,trial_number,motor_condition,display_condition,menu_condition,current_selection,target_selection,event_type,x,y,angle\n");
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
						for (var i = 1; i < splitContent.length; i++) {
							var condition = {
									motorCondition: splitContent[i].split(",")[1].replace(/(\r\n|\n|\r)/gm,""), 
									displayCondition: splitContent[i].split(",")[2].replace(/(\r\n|\n|\r)/gm,""), 
									menuCondition: splitContent[i].split(",")[3].replace(/(\r\n|\n|\r)/gm,"")
							}
							conditions[i] = condition;
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

function highLight(itemIndex, menus){

	if(itemIndex < menus.length && itemIndex > -1)
	{
		//remove a previous highlight
		let highlighted = document.querySelectorAll('.highlight');
		for(var itrh = 0; itrh < highlighted.length; itrh++)
		{
			highlighted[itrh].classList.remove('highlight');
		}

		var item = menus[itemIndex];
		item.classList.add('highlight');
	}
}

function log(data) {
	var currItem;
	var targetItem;
	
	if(rotationCount > -1) {
		currItem = imgPaths[rotationCount];
	} else {
		currItem = "unselected";
	}
	
	if (currTarget > -1){
		targetItem = targetImagePaths[currTarget];
	} else {
		targetItem = "no_target";
	}
	if (dataFile !== null) {
		dataFile.openStream("a", function(fs) {
			fs.write(data.log_type + "," + data.timestamp + "," + participantId + "," + currTrial + "," + conditions[currTrial].motorCondition + "," +
					conditions[currTrial].displayCondition + "," + conditions[currTrial].menuCondition + "," + currItem + "," + targetItem + "," +
					data.event_type + "," + data.x + "," + data.y + "," + data.angle + "\n");
			fs.close();
		}, function(e) {
			console.log("Error " + e.message);
		}, "UTF-8");
	}
}

function logEvent(data) {
	var currItem;
	var targetItem;
	
	if(rotationCount > -1) {
		currItem = imgPaths[rotationCount];
	} else {
		currItem = "unselected";
	}
	
	if (currTarget > -1){
		targetItem = targetImagePaths[currTarget];
	} else {
		targetItem = "no_target";
	}
	if (eventsFile !== null) {
		eventsFile.openStream("a", function(fs) {
			fs.write(data.log_type + "," + data.timestamp + "," + participantId + "," + currTrial + "," + conditions[currTrial].motorCondition + "," +
					conditions[currTrial].displayCondition + "," + conditions[currTrial].menuCondition + "," + currItem + "," + targetItem + "," +
					data.event_type + "," + data.x + "," + data.y + "," + data.angle + "\n");
			fs.close();
		}, function(e) {
			console.log("Error " + e.message);
		}, "UTF-8");
	}
}

function clickEvent(event) {
	console.log(event);
	var data = {
		log_type: "data",
		timestamp : Date.now() - currDate,
		event_type : event.type,
		x : event.clientX,
		y : event.clientY,
		angle : 0
	};
	console.log(data);
	log(data);
	console.log("timestamp: " + (Date.now() - currDate) + " type: " + event.type + " x: "
			+ event.clientX + " y: " + event.clientY);
	if(inTrial) {
		selectionCheck(event.clientX, event.clientY);
	}
	toggleTrial();
}

function toggleTrial() {
	if (state.innerHTML === "Start") {
		rotationCount = -1;
		currAngle = 0;
		currDate = Date.now();
		window.addEventListener("rotarydetent", rotaryEventHandler);
		state.innerHTML = "";
		inTrial = true;
		resetMenu();
		setMenuLayout();
		loadTarget();
		document.querySelector("#ss_menu").style.visibility = "visible";
		//document.querySelector("#trial-condition").style.visibility = "visible";
	} else if (state.innerHTML !== "Start" && !inTrial) {
		window.removeEventListener("rotarydetent", rotaryEventHandler);
		if(currTrial < conditions.length - 1) {
			state.innerHTML = "Start";
			currTrial++;
			document.querySelector("#target-img").style.visibility = "hidden";
			hideMenu();
		} else {
			document.querySelector("#target-img").style.visibility = "hidden";
			hideMenu();
			state.innerHTML = "Complete";
		}
	}
}

function rotaryEventHandler(event) {
		let direction = event.detail.direction;
		var data;
		var prevItem = '';
		if(direction === 'CW')
		{
			if (motorRotationCount > -1 && !turnRight) {
				motorRotationCount = 0
				turnRight = true;
			}
			currAngle += 15;
			motorRotationCount++;
			if(motorRotationConditions[conditions[currTrial].motorCondition - 1] == motorRotationCount) {
				if (rotationCount !== -1) {
					prevItem = imgPaths[rotationCount];
				}
				rotationCount++;
				if(prevItem !== ''){
					checkOvershoot(prevItem);
				}
				motorRotationCount = 0;
			}
			if(rotationCount == ss_num)
			{
				rotationCount = 0;
			}
			data = {
				log_type: "data",
				timestamp : Date.now() - currDate,
				event_type : "rotary",
				x : 0,
				y : 0,
				angle : currAngle
			};
			console.log(motorRotationCount);
			log(data);
			console.log("timestamp: " + (Date.now() - currDate) + " type: " + "rotary" + " current angle: " + currAngle);

		} else if(direction === 'CCW')
		{
			if (motorRotationCount > -1 && turnRight) {
				motorRotationCount = 0
				turnRight = false;
			}
			motorRotationCount++
			if(motorRotationConditions[conditions[currTrial].motorCondition - 1] == motorRotationCount) {
				if (rotationCount !== -1) {
					var prevItem = imgPaths[rotationCount];
				}
				rotationCount--;
				if(prevItem !== ''){
					checkOvershoot(prevItem);
				}
				motorRotationCount = 0;
			}
			currAngle -= 15;
			if(rotationCount < 0)
			{
				rotationCount = ss_num - 1; 
			}
			data = {
				log_type: "data",
				timestamp : Date.now() - currDate,
				event_type : "rotary",
				x : 0,
				y : 0,
				angle : currAngle
			};
			console.log(motorRotationCount);
			log(data);
			console.log("timestamp: " + (Date.now() - currDate) + " type: " + "rotary" + " current angle: " + currAngle);
		}
		//console.log(rotationCount);
		if (rotationCount > -1) {
			highLight(rotationCount, ss_menus);
		}
}

function checkOvershoot(prevItem) {
	if(prevItem.includes(targetImagePaths[currTarget])) {
		var data = {
				log_type: "penalty",
				timestamp : Date.now() - currDate,
				event_type : "item_overshoot_penalty",
				x : 0,
				y : 0,
				angle : currAngle
			};
		logEvent(data);
	}
}

//layout of menus
function setMenuLayout(){
	ss_menus = document.querySelectorAll('#ss_menu > div');
	ss_num = ss_menus.length;
	var ss_seg_ang = displayConditions[conditions[currTrial].displayCondition - 1];
	var page_center_x = 180, page_center_y = 180, page_radius = 130;

	for(var ss_itr = 0; ss_itr < ss_menus.length; ss_itr++)
	{
		let ss_menu = ss_menus[ss_itr];
		ss_menu.style.top = page_center_y - ss_menu.getBoundingClientRect().top - ss_menu.getBoundingClientRect().height / 2
			- page_radius * Math.cos(ss_seg_ang * ss_itr) + 'px'; 
		ss_menu.style.left = page_center_x - ss_menu.getBoundingClientRect().left - ss_menu.getBoundingClientRect().width / 2 
			+ page_radius * Math.sin(ss_seg_ang * ss_itr) + 'px';
		var img = document.querySelectorAll("#menu-img");
		img[ss_itr].src = imgPaths[ss_itr];
	}

}

function hideMenu() {
	document.querySelector("#ss_menu").style.visibility = "hidden";
}

function resetMenu() {
	$('#ss_menu').empty();
	$('#ss_menu').append('<div><img id="menu-img"></img></div>');
	$('#ss_menu').append('<div><img id="menu-img"></img></div>');
	$('#ss_menu').append('<div><img id="menu-img"></img></div>');
	$('#ss_menu').append('<div><img id="menu-img"></img></div>');
	$('#ss_menu').append('<div><img id="menu-img"></img></div>');
	$('#ss_menu').append('<div><img id="menu-img"></img></div>');
	$('#ss_menu').append('<div><img id="menu-img"></img></div>');
	$('#ss_menu').append('<div><img id="menu-img"></img></div>');
}

function loadTarget() {
	shuffleTargets();
	currTarget = 0;
	var targetImg = document.querySelector("#target-img");
	targetImg.src = targetImagePaths[currTarget];
	targetImg.style.visibility = "visible";
}

function selectionCheck(clickX, clickY) {
	var targetImg = document.querySelector("#target-img").src;
	var selectedPath = imgPaths[rotationCount];
	if (targetImg.includes(selectedPath)) {
		//Check if block is complete
		var data = {
				log_type: "selection",
				timestamp : Date.now() - currDate,
				event_type : "correct_selection",
				x : clickX,
				y : clickY,
				angle : currAngle
			};
		logEvent(data);
		if (currTarget == targetImagePaths.length - 1) {
			inTrial = false;
		} else {
			currTarget++;
			$("#target-img").attr('src', targetImagePaths[currTarget]);
			console.log("Current Target: " + targetImagePaths[currTarget]);
		}
		// Log Selection Data
	} else {
		// Log penalty, Show error?
		var data = {
				log_type: "penalty",
				timestamp : Date.now() - currDate,
				event_type : "wrong_selection",
				x : clickX,
				y : clickY,
				angle : currAngle
			};
		logEvent(data);
	}
}

function shuffleTargets() {
	  var currentIndex = targetImagePaths.length, temporaryValue, randomIndex;

	  // While there remain elements to shuffle...
	  while (0 !== currentIndex) {

	    // Pick a remaining element...
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;

	    // And swap it with the current element.
	    temporaryValue = targetImagePaths[currentIndex];
	    targetImagePaths[currentIndex] = targetImagePaths[randomIndex];
	    targetImagePaths[randomIndex] = temporaryValue;
	  }
}


window.onload = function () {
	state = document.getElementById("trial-state");
	document.querySelector("#target-img").style.visibility = "hidden";
	setupStudy();
	//document.querySelector("#trial-condition").style.visibility = "hidden";
	//currCondition = document.getElementById("trial-condition");
	//touch screen event, used for debugging
	state.innerHTML = "Start";
	document.addEventListener("click", clickEvent);

};


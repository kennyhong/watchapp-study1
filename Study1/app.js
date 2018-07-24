"use strict";

var currAngle = 0;
var trialSet = 1;
var currTrial = 0;
var conditions = [];
var documentsDir, dataFile, eventsFile;
var isMenuVisable = true;
var participantId = 1;
var state;
var currCondition;

var overshoots = 0;

var currDate = Date.now();
var ss_num = 0;
var ss_menus;
var imgPaths = [ 'icons/images/apple.png', 'icons/images/cat.png',
		'icons/images/zebra.png', 'icons/images/printer.png',
		'icons/images/paperclip.png', 'icons/images/carrot.png',
		'icons/images/pineapple.png', 'icons/images/penguin.png' ];
var inTrial = false;
var motorRotationConditions = [ 1, 2, 3 ];
var motorRotationCount = 0;
var displayConditions = [ (Math.PI / 12), (Math.PI / 6), (Math.PI / 4) ];
var rotationCount = 0;

var turnRight = false;

var targetImagePaths = [0, 1, 2, 3, 4, 5, 6, 7];
var currTarget = -1;

var targetRepeats = 0;

var errId = 0;

var timeoutHandler;

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
						fs.write("timestamp,participant_id,trial_number,motor_condition,display_condition,eyes_free_condition," +
								"id_current_selection,current_selection,id_target_selection,target_selection," +
								"event_type,x,y,angle,total_angle\n");
						fs.close();
					}, function(e) {
						console.log("Error " + e.message);
					}, "UTF-8");
				}
				
				//create new events csv
				eventsFile = documentsDir.createFile('participant' + participantId
						+ '_summary.csv');
				if (eventsFile !== null) {
					eventsFile.openStream("w", function(fs) {
						fs.write("participant_id,trial_number,motor_condition,display_condition,eyes_free_condition," +
								"id_current_selection,current_selection,id_target_selection,target_selection,target_angle," +
								"selection_success,num_overshoots,selection_time,total_rotation_angle\n");
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
									eyesFreeCondition: splitContent[i].split(",")[3].replace(/(\r\n|\n|\r)/gm,"")
							}
							conditions[i] = condition;
						}
						console.log(conditions);
						currCondition.innerHTML = "Motor: " + conditions[1].motorCondition + " tick(s) | E-F: " + conditions[trialSet].eyesFreeCondition;
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
	if (documentsDir) {
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
		participant : nextId
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

function removeHighlight() {
	let
	highlighted = document.querySelectorAll('.highlight');
	for (var itrh = 0; itrh < highlighted.length; itrh++) {
		highlighted[itrh].classList.remove('highlight');
	}
}

function highLight(itemIndex, menus) {

	if (itemIndex < menus.length && itemIndex > -1) {
		// remove a previous highlight
		removeHighlight();

		var item = menus[itemIndex];
		item.classList.add('highlight');
	}
}

function log(data) {
	var currItem;
	var targetItem;

	if (rotationCount > -1) {
		currItem = cleanImageFilePath(imgPaths[rotationCount]);
	} else {
		currItem = "unselected";
	}

	if (currTarget > -1) {
		targetItem = cleanImageFilePath(imgPaths[targetImagePaths[currTarget]]);
	} else {
		targetItem = "no_target";
	}
	if (dataFile !== null) {
		dataFile.openStream("a", function(fs) {
			fs.write(data.timestamp + "," + participantId
					+ "," + currTrial + ","
					+ conditions[trialSet].motorCondition + ","
					+ conditions[trialSet].displayCondition + ","
					+ conditions[trialSet].eyesFreeCondition + "," 
					+ data.curr_id + "," + currItem + "," + (targetImagePaths[currTarget] + 1)
					+ "," + targetItem + "," + data.event_type + "," + data.x
					+ "," + data.y + "," + data.angle + "," + data.total_angle + "\n");
			fs.close();
		}, function(e) {
			console.log("Error " + e.message);
		}, "UTF-8");
	}
}

function logSummary(data) {
	var currItem;
	var targetItem;
	var targetAngle;
	
	if(conditions[trialSet].displayCondition == 1) {
		targetAngle = targetImagePaths[currTarget] * 15;
	} else if (conditions[trialSet].displayCondition == 2) {
		targetAngle = targetImagePaths[currTarget] * 30;
	} else if (conditions[trialSet].displayCondition == 3) {
		targetAngle = targetImagePaths[currTarget] * 45;
	} else {
		targetAngle = -1;
	}

	if (rotationCount > -1) {
		currItem =  cleanImageFilePath(imgPaths[rotationCount]);
	} else {
		currItem = "unselected";
	}

	if (currTarget > -1) {
		targetItem = cleanImageFilePath(imgPaths[targetImagePaths[currTarget]]);
	} else {
		targetItem = "no_target";
	}
	if (eventsFile !== null) {
		eventsFile.openStream("a", function(fs) {
			fs.write(participantId + "," + currTrial + ","
					+ conditions[trialSet].motorCondition + ","
					+ conditions[trialSet].displayCondition + ","
					+ conditions[trialSet].eyesFreeCondition + "," 
					+ data.selection_id + "," + currItem + "," + data.target_id
					+ "," + targetItem + "," + targetAngle + "," + data.success + "," + data.num_overshoots + "," + data.timestamp
					 + "," + data.angle + "\n");
			fs.close();
		}, function(e) {
			console.log("Error " + e.message);
		}, "UTF-8");
	}
}

function cleanImageFilePath(str) {
    var split = str.split("/")[2];
    var res = split.slice(0, split.indexOf('.'));
    
    return res;
}

function clickEvent(event) {
	if(inTrial) {
		delayMenuAppearance();
	}
	var data = {
		timestamp : Date.now() - currDate,
		event_type : event.type,
		x : event.clientX,
		y : event.clientY,
		angle : 0,
		total_angle : 0,
		curr_id: rotationCount + 1
	};
	log(data);
	console.log("timestamp: " + (Date.now() - currDate) + " type: "
			+ event.type + " x: " + event.clientX + " y: " + event.clientY);
	if (inTrial) {
		selectionCheck(event.clientX, event.clientY);
		currTrial++;
	} 
	toggleTrial();
	currDate = Date.now();
	currAngle = 0;
}

function toggleTrial() {
	if (state.innerHTML === "Start") {
		rotationCount = 0;
		currDate = Date.now();
		window.addEventListener("rotarydetent", rotaryEventHandler);
		state.innerHTML = "";
		inTrial = true;
		resetMenu();
		setMenuLayout();
		loadTarget();
		motorRotationCount = 0;
		document.querySelector("#ss_menu").style.visibility = "visible";
		highLight(rotationCount, ss_menus);
		if (conditions[trialSet].eyesFreeCondition === "true") {
			$('#ss_menu').hide();
			timeoutHandler = setTimeout(function () {$('#ss_menu').show()}, 1000);
		}
		
	} else if (state.innerHTML !== "Start" && !inTrial) {
		window.removeEventListener("rotarydetent", rotaryEventHandler);
		if (trialSet < conditions.length - 1) {
			state.innerHTML = "Start";
			trialSet++;
			currCondition.innerHTML = "Motor: " + conditions[trialSet].motorCondition + " tick(s) | E-F: " + conditions[trialSet].eyesFreeCondition;
			document.querySelector("#target-img").style.visibility = "hidden";
			hideMenu();
		} else {
			document.querySelector("#target-img").style.visibility = "hidden";
			hideMenu();
			currCondition.innerHTML = "";
			document.querySelector('#trial-state').style.marginLeft = "135px";
			state.innerHTML = "Complete";
		}
	}
}

function delayMenuAppearance() {
	clearTimeout(timeoutHandler);
	timeoutHandler = setTimeout(function () {$('#ss_menu').show()}, 1000);
}

function rotaryEventHandler(event) {
	let
	direction = event.detail.direction;
	var data;
	var prevItem = '';
	if(inTrial) {
		delayMenuAppearance();
	}
	if (direction === 'CW') {
		if (motorRotationCount > -1 && !turnRight) {
			motorRotationCount = 0
			turnRight = true;
		}
		currAngle += 15;
		motorRotationCount++;
		if (motorRotationConditions[conditions[trialSet].motorCondition - 1] == motorRotationCount) {
			if (rotationCount !== -1) {
				prevItem = imgPaths[rotationCount];
			}
			rotationCount++;
			if (prevItem !== '') {
				checkOvershoot(prevItem);
			}
			motorRotationCount = 0;
			if (rotationCount == ss_num) {
				rotationCount = 0;
			}
		}
		data = {
			timestamp : Date.now() - currDate,
			event_type : "rotary",
			x : 0,
			y : 0,
			angle : '+15',
			total_angle: currAngle
		};
		log(data);
		console.log("timestamp: " + (Date.now() - currDate) + " type: "
				+ "rotary" + " current angle: " + currAngle);

	} else if (direction === 'CCW') {
		if (motorRotationCount > -1 && turnRight) {
			motorRotationCount = 0
			turnRight = false;
		}
		motorRotationCount++;
		if (motorRotationConditions[conditions[trialSet].motorCondition - 1] == motorRotationCount) {
			if (rotationCount !== -1) {
				var prevItem = imgPaths[rotationCount];
			}
			rotationCount--;
			if (prevItem !== '') {
				checkOvershoot(prevItem);
			}
			if (rotationCount < 0) {
				rotationCount = ss_num - 1;
			}
			motorRotationCount = 0;
		}
		currAngle -= 15;
		data = {
			timestamp : Date.now() - currDate,
			event_type : "rotary",
			x : 0,
			y : 0,
			angle : '-15',
			total_angle : currAngle
		};
		log(data);
		console.log("timestamp: " + (Date.now() - currDate) + " type: "
				+ "rotary" + " current angle: " + currAngle);
	}
	// console.log(rotationCount);
	if (rotationCount > -1) {
		highLight(rotationCount, ss_menus);
	}
}

function checkOvershoot(prevItem) {
	if (prevItem.includes(imgPaths[targetImagePaths[currTarget]])) {
		overshoots++;
	}
}

// layout of menus
function setMenuLayout() {
	ss_menus = document.querySelectorAll('#ss_menu > div');
	ss_num = ss_menus.length;
	var ss_seg_ang = displayConditions[conditions[trialSet].displayCondition - 1];
	var page_center_x = 180, page_center_y = 180, page_radius = 130;

	for (var ss_itr = 0; ss_itr < ss_menus.length; ss_itr++) {
		let
		ss_menu = ss_menus[ss_itr];
		ss_menu.style.top = page_center_y - ss_menu.getBoundingClientRect().top
				- ss_menu.getBoundingClientRect().height / 2 - page_radius
				* Math.cos(ss_seg_ang * ss_itr) + 'px';
		ss_menu.style.left = page_center_x
				- ss_menu.getBoundingClientRect().left
				- ss_menu.getBoundingClientRect().width / 2 + page_radius
				* Math.sin(ss_seg_ang * ss_itr) + 'px';
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
	targetImg.src = imgPaths[targetImagePaths[currTarget]];
	targetImg.style.visibility = "visible";
}

function selectionCheck(clickX, clickY) {
	var targetImg = document.querySelector("#target-img").src;
	var selectedPath = imgPaths[rotationCount];
	if (targetImg.includes(selectedPath)) {
		// Check if block is complete
		var data = {
			timestamp : Date.now() - currDate,
			success: true,
			num_overshoots: overshoots,
			selection_id: rotationCount + 1,
			angle : currAngle,
			target_id : targetImagePaths[currTarget] + 1
		};
		logSummary(data);
		iterateTarget();
		motorRotationCount = 0;
		overshoots = 0;
		// Log Selection Data
	} else {
		// Log penalty, go on to the next item
		var data = {
			timestamp : Date.now() - currDate,
			success : false,
			num_overshoots: overshoots,
			selection_id: rotationCount + 1,
			angle : currAngle,
			target_id : targetImagePaths[currTarget] + 1
		};
		logSummary(data);
		iterateTarget();
		motorRotationCount = 0;
		overshoots = 0;
	}
}
	
function iterateTarget() {
	if (currTarget == targetImagePaths.length - 1 && targetRepeats > 1) {
		inTrial = false;
		targetRepeats = 0;
	} else {
		currTarget++;
		if (currTarget > 7) {
			shuffleTargets();
			currTarget = 0;
			targetRepeats++;
		}
		$("#target-img").attr('src', imgPaths[targetImagePaths[currTarget]]);
		console.log("Current Target: " + imgPaths[targetImagePaths[currTarget]]);
	}
	removeHighlight();
	rotationCount = 0;
	highLight(rotationCount, ss_menus);
}

function shuffleTargets() {
	var currentIndex = targetImagePaths.length, temporaryValue, randomIndex;
	
	while (0 !== currentIndex) {

		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temporaryValue = targetImagePaths[currentIndex];
		targetImagePaths[currentIndex] = targetImagePaths[randomIndex];
		targetImagePaths[randomIndex] = temporaryValue;
	}
}

window.onload = function() {
	state = document.getElementById("trial-state");
	document.querySelector("#target-img").style.visibility = "hidden";
	setupStudy();
	currCondition = document.getElementById("trial-condition");
	state.innerHTML = "Start";
	document.addEventListener("click", clickEvent);
}

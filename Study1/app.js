"use strict";

var currAngle = 0;
var trialSet = 1; // 72
var currTrial = 0; 
var trials = [];
var currCondition;
var trialCount = 0;
var conditionNum = 0;
var documentsDir, dataFile, eventsFile;
var isMenuVisable = true;
var participantId = 0;
var state;
var failFeedback;
var successFeedback;

var num_cw = 0;
var num_ccw = 0;

var overshoots = 0;
var firstRotationTime = -1;
var firstRotationBool = false;

var currDate = Date.now();
var ss_num = 0;
var ss_menus;
var imgPaths = 
		//1
		[['icons/images/frog.png', 'icons/images/dog.png',
		'icons/images/fish.png', 'icons/images/pigeon.png',
		'icons/images/cat.png', 'icons/images/zebra.png',
		'icons/images/dolphin.png', 'icons/images/penguin.png'],
		//2
		['icons/images/grapes.png', 'icons/images/lemon.png',
		'icons/images/kiwi.png', 'icons/images/pineapple.png',
		'icons/images/strawberry.png', 'icons/images/watermelon.png',
		'icons/images/peach.png', 'icons/images/pear.png'],
		//3
		['icons/images/onion.png', 'icons/images/cucumber.png',
		'icons/images/pumpkin.png', 'icons/images/garlic.png',
		'icons/images/corn.png', 'icons/images/broccoli.png',
		'icons/images/artichoke.png', 'icons/images/carrot.png'],
		//4
		['icons/images/baseball.png', 'icons/images/hockey.png',
		'icons/images/basketball.png', 'icons/images/tennis.png',
		'icons/images/darts.png', 'icons/images/karate.png',
		'icons/images/pool.png', 'icons/images/cards.png'],
		//5
		['icons/images/pepper.png', 'icons/images/potato.png',
		'icons/images/mushroom.png', 'icons/images/prune.png',
		'icons/images/lettuce.png', 'icons/images/cherry.png',
		'icons/images/fish.png', 'icons/images/garlic.png'],
		//6
		['icons/images/bowtie.png', 'icons/images/button.png',
		'icons/images/dress_shirt.png', 'icons/images/gloves.png',
		'icons/images/skirt.png', 'icons/images/socks.png',
		'icons/images/hat.png', 'icons/images/sweater.png'],
		//7
		['icons/images/stapler.png', 'icons/images/printer.png',
		'icons/images/pencil.png', 'icons/images/trash.png',
		'icons/images/paperclip.png', 'icons/images/envelope.png',
		'icons/images/keyboard.png', 'icons/images/clock.png'],
		//8
		['icons/images/stamp.png', 'icons/images/rubikscube.png',
		'icons/images/dice.png', 'icons/images/mouse.png',
		'icons/images/darts.png', 'icons/images/chess.png',
		'icons/images/telephone.png', 'icons/images/chair.png'],
		//9
		['icons/images/mushroom.png', 'icons/images/fish.png',
		'icons/images/lettuce.png', 'icons/images/pepper.png',
		'icons/images/onion.png', 'icons/images/artichoke.png',
		'icons/images/lemon.png', 'icons/images/broccoli.png']];

var inTrial = false;
var motorRotationConditions = [ 1, 2, 3 ];
var motorRotationCount = 0;
var visualConditions = [ (Math.PI / 12), (Math.PI / 6), (Math.PI / 4) ];
var rotationCount = 0;

var turnRight = false;
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
						fs.write("timestamp,participant_id,trial_number,block,motor_condition,visual_condition," +
								"id_current_selection,current_selection,id_target_selection,target_selection," +
								"event_type,x,y,angle,total_angle,num_+15,num_-15\n");
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
						fs.write("participant_id,trial_number,block,motor_condition,visual_condition," +
								"id_current_selection,current_selection,id_target_selection,target_selection,target_angle," +
								"selection_success,num_overshoots,selection_time,first_rotation_time,total_rotation_angle,num_+15,num_-15\n");
						fs.close();
					}, function(e) {
						console.log("Error " + e.message);
					}, "UTF-8");
				}
				
				//load study
				studyInfo = documentsDir.resolve('p'+ participantId + '.csv');
				var trialsSetupNum = 0;
				var blockSetupNum = 0;
				if (studyInfo) {
					studyInfo.openStream('r', function(stream){
						studyCSVContent = stream.read(stream.bytesAvailable);
						var splitContent = studyCSVContent.split("\r");
						console.log(splitContent.length);
						for (var i = 1; i < splitContent.length; i++) {
								var trial = {
										motorCondition: splitContent[i].split(",")[4].replace(/(\r\n|\n|\r)/gm,""), 
										visualCondition: splitContent[i].split(",")[3].replace(/(\r\n|\n|\r)/gm,""),
										blockNum: splitContent[i].split(",")[5].replace(/(\r\n|\n|\r)/gm,""),
										target: splitContent[i].split(",")[6].replace(/(\r\n|\n|\r)/gm,""),
										trial: splitContent[i].split(",")[2].replace(/(\r\n|\n|\r)/gm,""),
								}
								trials[trialsSetupNum++] = trial;
						}
						currCondition.innerHTML = "Motor: " + trials[0].motorCondition + " ticks";
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
		currItem = cleanImageFilePath(imgPaths[conditionNum][rotationCount]);
	} else {
		currItem = "unselected";
	}

	if ((data.target_id - 1) > -1 && inTrial) {
		targetItem = cleanImageFilePath(imgPaths[conditionNum][data.target_id - 1]);
	} else {
		targetItem = "no_target";
	}
	if (dataFile !== null) {
		dataFile.openStream("a", function(fs) {
			fs.write(data.timestamp + "," + participantId
					+ "," + currTrial + "," + data.curr_block + ","
					+ "motor_" + data.curr_motor + ","
					+ "visual_" + data.curr_visual + ","
					+ data.selection_id + "," + currItem + "," + data.target_id
					+ "," + targetItem + "," + data.event_type + "," + data.x
					+ "," + data.y + "," + data.angle + "," + data.total_angle + "," + num_cw + "," + num_ccw + "\n");
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
	
	if(trials[currTrial].visualCondition == 1) {
		targetAngle = (data.target_id - 1) * 15;
	} else if (trials[currTrial].visualCondition == 2) {
		targetAngle = (data.target_id - 1) * 30;
	} else if (trials[currTrial].visualCondition == 3) {
		targetAngle = (data.target_id - 1) * 45;
	} else {
		targetAngle = -1;
	}

	if (rotationCount > -1) {
		currItem = cleanImageFilePath(imgPaths[conditionNum][rotationCount]);
	} else {
		currItem = "unselected";
	}

	if ((data.target_id - 1) > -1 && inTrial) {
		targetItem = cleanImageFilePath(imgPaths[conditionNum][data.target_id - 1]);
	} else {
		targetItem = "no_target";
	}
	if (eventsFile !== null) {
		eventsFile.openStream("a", function(fs) {
			fs.write(participantId + "," + currTrial + "," + data.curr_block + ","
					+ "motor_" + data.curr_motor + ","
					+ "visual_" + data.curr_visual + ","
					+ data.selection_id + "," + currItem + "," + data.target_id
					+ "," + targetItem + "," + targetAngle + "," + data.success + "," + data.num_overshoots + "," + data.timestamp
					 + "," + firstRotationTime + "," + data.angle + "," + data.num_pos15 + "," + data.num_neg15 + "\n");
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
		selection_id: rotationCount + 1,
		target_id : trials[currTrial].target,
		curr_motor: trials[currTrial].motorCondition,
		curr_visual: trials[currTrial].visualCondition,
		curr_block: trials[currTrial].blockNum
		// curr_ef: trials[currTrial].eyesFreeCondition
	};
	log(data);
	console.log("timestamp: " + (Date.now() - currDate) + " type: "
			+ event.type + " x: " + event.clientX + " y: " + event.clientY);
	if (inTrial) {
		selectionCheck(event.clientX, event.clientY);
	} 
	toggleTrial();
	currDate = Date.now();
	currAngle = 0;
}

function toggleTrial() {
	if (state.innerHTML === "Start") {
		rotationCount = 0;
		num_cw = 0;
		num_ccw = 0;
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
//		if (conditions[trialSet].eyesFreeCondition === "true" || conditions[trialSet].eyesFreeCondition === "TRUE") {
//			$('#ss_menu').hide();
//			timeoutHandler = setTimeout(function () {$('#ss_menu').show()}, 1000);
//		}
		
	} else if (state.innerHTML !== "Start" && !inTrial) {
		window.removeEventListener("rotarydetent", rotaryEventHandler);
		if (currTrial < trials.length - 1) {
			state.innerHTML = "Start";
			conditionNum++;
			currCondition.innerHTML = "Motor: " + trials[currTrial].motorCondition + " ticks";
			document.querySelector("#target-img").style.visibility = "hidden";
			$("#target-img").attr('src', '');
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
	if(inTrial && !firstRotationBool) {
		firstRotationTime = Date.now() - currDate;
		firstRotationBool = true;
	}
	if (direction === 'CW') {
		num_cw++;
		if (motorRotationCount > -1 && !turnRight) {
			motorRotationCount = 0
			turnRight = true;
		}
		currAngle += 15;
		motorRotationCount++;
		if (motorRotationConditions[trials[currTrial].motorCondition - 1] == motorRotationCount) {
			if (rotationCount !== -1) {
				prevItem = imgPaths[conditionNum][rotationCount];
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
			total_angle: currAngle,
			selection_id: rotationCount + 1,
			target_id : trials[currTrial].target,
			curr_motor: trials[currTrial].motorCondition,
			curr_visual: trials[currTrial].visualCondition,
			curr_block: trials[currTrial].blockNum
			//curr_ef: conditions[trialSet].eyesFreeCondition
		};
		log(data);
		console.log("timestamp: " + (Date.now() - currDate) + " type: "
				+ "rotary" + " current angle: " + currAngle);

	} else if (direction === 'CCW') {
		num_ccw++;
		if (motorRotationCount > -1 && turnRight) {
			motorRotationCount = 0
			turnRight = false;
		}
		motorRotationCount++;
		if (motorRotationConditions[trials[currTrial].motorCondition - 1] == motorRotationCount) {
			if (rotationCount !== -1) {
				var prevItem = imgPaths[conditionNum][rotationCount];
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
			total_angle : currAngle,
			selection_id: rotationCount + 1,
			target_id : trials[currTrial].target,
			curr_motor: trials[currTrial].motorCondition,
			curr_visual: trials[currTrial].visualCondition,
			curr_block: trials[currTrial].blockNum
			//curr_ef: conditions[trialSet].eyesFreeCondition
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
	if (prevItem.includes(imgPaths[conditionNum][trials[currTrial].target - 1])) {
		overshoots++;
	}
}

// layout of menus
function setMenuLayout() {
	ss_menus = document.querySelectorAll('#ss_menu > div');
	ss_num = ss_menus.length;
	var ss_seg_ang = visualConditions[trials[currTrial].visualCondition - 1];
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
		img[ss_itr].src = imgPaths[conditionNum][ss_itr];
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
	//shuffleTargets();
	//currTarget = 0;
	var targetImg = document.querySelector("#target-img");
	targetImg.src = imgPaths[conditionNum][trials[currTrial].target - 1];
	targetImg.style.visibility = "visible";
}

function selectionCheck(clickX, clickY) {
	var targetImg = document.querySelector("#target-img").src;
	var selectedPath = imgPaths[conditionNum][rotationCount];
	if (targetImg.includes(selectedPath)) {
		successFeedback.play();
		// Check if block is complete
		var data = {
			timestamp : Date.now() - currDate,
			success: true,
			num_overshoots: overshoots,
			selection_id: rotationCount + 1,
			angle : currAngle,
			target_id : trials[currTrial].target,
			curr_motor: trials[currTrial].motorCondition,
			curr_visual: trials[currTrial].visualCondition,
			curr_block: trials[currTrial].blockNum,
			num_pos15: num_cw,
			num_neg15: num_ccw
			//curr_ef: trials[currTrial].eyesFreeCondition
		};
		logSummary(data);
		iterateTarget();
		motorRotationCount = 0;
		overshoots = 0;
		firstRotationBool = false;
		// Log Selection Data
	} else {
		failFeedback.play();
		// Log penalty, go on to the next item
		var data = {
			timestamp : Date.now() - currDate,
			success : false,
			num_overshoots: overshoots,
			selection_id: rotationCount + 1,
			angle : currAngle,
			target_id : trials[currTrial].target,
			curr_motor: trials[currTrial].motorCondition,
			curr_visual: trials[currTrial].visualCondition,
			curr_block: trials[currTrial].blockNum,
			num_pos15: num_cw,
			num_neg15: num_ccw
			//curr_ef: conditions[trialSet].eyesFreeCondition
		};
		logSummary(data);
		iterateTarget();
		motorRotationCount = 0;
		overshoots = 0;
		firstRotationBool = false;
	}
}
	
function iterateTarget() {
	currTrial++;
	if(trials[currTrial]){
		if (trials[currTrial].blockNum == 1 && ((currTrial) % 64 == 0)) {
			inTrial = false;
		}
		else {
			$("#target-img").attr('src', imgPaths[conditionNum][trials[currTrial].target - 1]);
		}
	} else {
		inTrial = false;
	}
	
	removeHighlight();
	rotationCount = 0;
	num_cw = 0;
	num_ccw = 0;
	highLight(rotationCount, ss_menus);
}
//
//function shuffleTargets() {
//	var currentIndex = targetImagePaths.length, temporaryValue, randomIndex;
//	
//	while (0 !== currentIndex) {
//
//		randomIndex = Math.floor(Math.random() * currentIndex);
//		currentIndex -= 1;
//
//		temporaryValue = targetImagePaths[currentIndex];
//		targetImagePaths[currentIndex] = targetImagePaths[randomIndex];
//		targetImagePaths[randomIndex] = temporaryValue;
//	}
//}

window.onload = function() {
	state = document.getElementById("trial-state");
	failFeedback = document.getElementById("fail");
	successFeedback = document.getElementById("success");
	document.querySelector("#target-img").style.visibility = "hidden";
	setupStudy();
	currCondition = document.getElementById("trial-condition");
	state.innerHTML = "Start";
	document.addEventListener("click", clickEvent);
}

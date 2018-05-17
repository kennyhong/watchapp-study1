"use strict";

window.onload = function () {

	window.addEventListener("tizenhwkey", function (ev) {
		var activePopup = null,
			page = null,
			pageid = "";

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


	//touch screen event
	document.addEventListener("click", function(){

		let text = document.querySelector('p');
    	text.innerHTML = "new test";

		animate(
    		1000,
    		draw, 
    		timing
    	);


	});

	function draw(progress){
		progressId.style.width = progress * 100 + '%';
	}

	function timing(timeFraction){
		return timeFraction;
	}

	document.addEventListener("rotarydetent", function(ev){
		var direction = ev.detail.direction;

		if(direction == 'CW')
		{
			animate(
	    		1000,
	    		draw, 
	    		timing
	    	);
		}else if(direction == 'CCW')
		{

		}
	});


	function animate(duration, draw, timing){
    	let start = performance.now();

    	requestAnimationFrame(function animate(time){
    		let timeFraction = (time - start) / duration;
    		if(timeFraction > 1) timeFraction = 1;
    		
    		let progress = timing(timeFraction);
    		
    		draw(progress);
    		
    		if(timeFraction < 1)
    		{
    			requestAnimationFrame(animate);
    		}
    	});
    }

};


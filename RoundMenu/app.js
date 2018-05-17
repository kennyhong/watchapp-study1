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


	//function module for animation
	function draw(progress){
		
	}

	function timing(timeFraction){
		return timeFraction;
	}

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

 
	//layout of menus
	let ss_num = 0;
	let ss_menus;
	function setMenuLayout(){
		ss_menus = document.querySelectorAll('#ss_menu > div');
		let ss_itr = 0;
		ss_num = ss_menus.length;
		let ss_seg_ang = Math.PI * 2 / ss_num;
		let page_center_x = 180, page_center_y = 180, page_radius = 130;

		for(ss_itr = 0; ss_itr < ss_menus.length; ss_itr++)
		{
			let ss_menu = ss_menus[ss_itr];
			ss_menu.style.top = page_center_y - ss_menu.getBoundingClientRect().top - ss_menu.getBoundingClientRect().height / 2
				- page_radius * Math.cos(ss_seg_ang * ss_itr) + 'px'; 
			ss_menu.style.left = page_center_x - ss_menu.getBoundingClientRect().left - ss_menu.getBoundingClientRect().width / 2 
				+ page_radius * Math.sin(ss_seg_ang * ss_itr) + 'px';
			//ss_itr++;
		}
	};
	
	setMenuLayout();

	//rotaty event
	let rotationCount = 0;

	document.addEventListener("rotarydetent", function(ev){
		let direction = ev.detail.direction;

		if(direction == 'CW')
		{
			rotationCount++;
			if(rotationCount == ss_num)
			{
				rotationCount = 0;
			}

		}else if(direction == 'CCW')
		{
			rotationCount--;
			if(rotationCount < 0)
			{
				rotationCount = ss_num - 1; 
			}
		}

		//console.log(rotationCount);
		highLight(rotationCount, ss_menus);

	});

	function highLight(itemIndex, menus){

		if(itemIndex < menus.length)
		{
			//remove a previous highlight
			let highlighted = document.querySelectorAll('.highlight');
			for(let itrh = 0; itrh < highlighted.length; itrh++)
			{
				highlighted[itrh].classList.remove('highlight');
			}
			
			let item = menus[itemIndex];
			item.classList.add('highlight');
		}
	}

	//touch screen event, used for debugging
	document.addEventListener("click", function(){
		

		rotationCount++;
		highLight(rotationCount, ss_menus);

	});

};


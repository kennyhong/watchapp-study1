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
		ss_num = ss_menus.length;
		let ss_seg_ang = Math.PI * 2 / ss_num;
		let page_center_x = 180, page_center_y = 180, page_radius = 130;

		for(let ss_itr = 0; ss_itr < ss_menus.length; ss_itr++)
		{
			let ss_menu = ss_menus[ss_itr];
			ss_menu.style.top = page_center_y - ss_menu.getBoundingClientRect().top - ss_menu.getBoundingClientRect().height / 2
				- page_radius * Math.cos(ss_seg_ang * ss_itr) + 'px'; 
			ss_menu.style.left = page_center_x - ss_menu.getBoundingClientRect().left - ss_menu.getBoundingClientRect().width / 2 
				+ page_radius * Math.sin(ss_seg_ang * ss_itr) + 'px';
		}
	};
	
	setMenuLayout();


	//submenu layout
	function setSubMenuLayout(){
		let tt_menus = document.querySelectorAll('.tt_menu');

		let tt_seg_ang = Math.PI / 6;
		let ss_seg_ang = Math.PI * 2 / ss_num;
		let tt_num = tt_menus.length < ss_num ? tt_menus.length : ss_num;

		let tt_center_x = 180, tt_center_y = 180, tt_radius = 70;

		for(let itrt = 0; itrt < tt_num ; itrt++)
		{
			let tt_menu = tt_menus[itrt];
			let startAng = ss_seg_ang * itrt;

			let tt_menu_items = tt_menu.querySelectorAll('div');
			
			for(let tt_itr = 0; tt_itr < tt_menu_items.length; tt_itr++)
			{
				let tt_menu_item = tt_menu_items[tt_itr];
				tt_menu_item.style.top = tt_center_y - tt_menu_item.getBoundingClientRect().top - tt_menu_item.getBoundingClientRect().height / 2
					- tt_radius * Math.cos(tt_seg_ang * tt_itr + startAng) + 'px'; 
				tt_menu_item.style.left = tt_center_x - tt_menu_item.getBoundingClientRect().left - tt_menu_item.getBoundingClientRect().width / 2 
					+ tt_radius * Math.sin(tt_seg_ang * tt_itr + startAng) + 'px';
			}

			tt_menu.style.visibility = 'hidden';
		}
	}

	setSubMenuLayout();

	//rotaty event
	let rotationCount = -1;

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

			//activate sub menus
			activateSubMenu(itemIndex);
		}
	}


	function activateSubMenu(subIndex){
		let tt_menus = document.querySelectorAll('.tt_menu');
		for(let itrt = 0; itrt < tt_menus.length; itrt++)
		{
			if(itrt == subIndex)
			{
				tt_menus[itrt].style.visibility = 'visible';
			}else{
				tt_menus[itrt].style.visibility = 'hidden';
			}
		}

	}

	//touch screen event, used for debugging
	document.addEventListener("click", function(){
		

		rotationCount++;
		highLight(rotationCount, ss_menus);

	});

};


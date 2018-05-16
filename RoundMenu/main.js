/**
 * a holder for customized js functions
 */
"use strict";


window.onload = function(){
	
	// function updateTime(){
	// 	let now = new Date();

	// 	let hour = now.getHours();
	// 	let min = now.getMinutes();
	// 	let sec = now.getSeconds();

	// 	document.getElementById("digit_hour").innerHTML = String(hour);
	// 	document.getElementById("digit_min").innerHTML = String(min);
	// 	document.getElementById("digit_sec").innerHTML = String(sec);
	// }

	// let timerId = setInterval(updateTime, 1000);


	let thumb = slider.querySelector('.thumb');
	thumb.onmousedown = function(event){
		event.preventDefault();

		thumb.classList.add('growing');

		let shiftX = event.clientX - thumb.getBoundingClientRect().left;

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);

		function onMouseMove(event){
			let newLeft = event.clientX - shiftX - slider.getBoundingClientRect().left;

	        // the pointer is out of slider => lock the thumb within the bounaries
	        if (newLeft < 0) {
	          newLeft = 0;
	        }
	        let rightEdge = slider.offsetWidth - thumb.offsetWidth;
	        if (newLeft > rightEdge) {
	          newLeft = rightEdge;
	        }

	        thumb.style.left = newLeft + 'px';
		}

		function onMouseUp(event){
			document.removeEventListener('mouseup', onMouseUp);
        	document.removeEventListener('mousemove', onMouseMove);
		}

		popUpCircle(100, 100, 50);

		function popUpCircle(cx, cy, radius){
			let div = document.createElement('div');
			div.style.width = 0;
			div.style.height = 0;
			div.style.left = cx + 'px';
			div.style.top = cy + 'px';
			div.className = 'circle';
			document.body.append(div);

			//activate an animation
			setTimeout(()=> {div.style.width = radius * 2 + 'px';
				div.style.height = radius * 2 + 'px';	
			} , 0);
		}

	};

	thumb.ondragstart = function() {
      return false;
    };

    main.onclick = function()
    {
    	animate({
    		duration: 1000,
    		timing: function(timeFraction){
    			return timeFraction;
    		},
    		draw: function(progress){
    			progressId.style.width = progress * 100 + '%';
    		}
    	});
    }

    function animate({duration, draw, timing}){
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
}


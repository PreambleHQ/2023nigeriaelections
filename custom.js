var slider = $(".wrapper-2").slick({
  accessibility: true,
  slide: "div",
  dots: true,
  centerMode: true,
  infinite: false,
  arrows: true,
  touchMove: true,
  speed: 500,
  variableWidth: true,
  slidesToShow: 1,
  focusOnSelect: true,
  pauseOnFocus: false,
  pauseOnHover: false,
  changeDir: true,
  prevArrow: $(".slide-prev"),
  nextArrow: $(".slide-next"),
});
var Timer = setInterval(function () {
  if (slider.slick("slickCurrentSlide") == 4) {
    slider.slick("slickSetOption", "speed", 1200);
    $(".wrapper-2").slick("slickGoTo", 0);
    slider.slick("slickSetOption", "speed", 500);
  } else {
    slider.slick("slickSetOption", "speed", 500);
    slider.slick("slickNext");
  }
}, 8000);
//keyboard function
$(document).on("keydown", function (e) {
  if (e.keyCode == 37) {
    $(".wrapper-2").slick("slickPrev");
    console.log("pre");
  }
  if (e.keyCode == 39) {
    $(".wrapper-2").slick("slickNext");
    console.log("next");
  }
});

slider.on("afterChange", function (event, slick, currentSlide, nextSlide) {
  clearInterval(Timer);
  Timer = setInterval(function () {
    if (slider.slick("slickCurrentSlide") == 4) {
      slider.slick("slickSetOption", "speed", 1200);
      slider.slick("slickGoTo", 0);
      slider.slick("slickSetOption", "speed", 500);
    } else {
      slider.slick("slickSetOption", "speed", 500);
      slider.slick("slickNext");
    }
  }, 8000);
});
/* On before slide change
slider.on('afterChange', function(event, slick, currentSlide, nextSlide)
{
  slider.slick('slickPlay');
	progressBar();
  
	var slideCount = slick.slideCount -1;
  if( slideCount === slider.slick('slickCurrentSlide'))
  {
 
		//jump to the first when hits the last slide
		slider.slick('slickPause')
 		/*setTimeout(function() 
    {
      
        slider.slick('slickGoTo', 0, false);
        slider.slick('slickPlay');
        //slider.slick('refresh')
        /* slider.slick('refresh');
				e.preventDefault();
  
				preventRefresh();
				const preventRefresh = 	e => {
  			slider.slick('refresh');
				e.preventDefault();
				} */

/*setTimeout(() => 
        {
        	slider.slick('refresh')
      	}, 1000);
     }, 8000); 
     
}
});*/

//************************************************************************
//progress bar
function progressBar() {
  var slickSlide = document.querySelectorAll(".slick-dots li");
  var slickSlideButton = document.querySelectorAll(".slick-dots li button");

  for (let i = 0; i < slickSlide.length; i++) {
    if (slickSlide[i].classList.contains("slick-active")) {
      break;
    }

    if (slickSlideButton[i].style.width !== "100%") {
      slickSlideButton[i].style.width = "100%";
    }
  }

  for (let i = slickSlide.length - 1; i > 0; i--) {
    if (slickSlide[i].classList.contains("slick-active")) {
      break;
    }
    if (
      slickSlideButton[i].style.width !== "0px" ||
      slickSlideButton[i].style.width !== "0"
    ) {
      slickSlideButton[i].style.width = "0";
    }
  }
}

window.setInterval(function () {
  progressBar();
}, 10);

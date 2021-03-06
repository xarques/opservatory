// function checkitem() {
//   var $this = $('#myCarousel');
//   if($('.carousel-inner .item:first').hasClass('active')) {
//     $this.children('.left.carousel-control').hide();
//   } else if($('.carousel-inner .item:last').hasClass('active')) {
//     $this.children('.right.carousel-control').hide();
//   } else {
//     $this.children('.carousel-control').show();
//   }
// }

function organizeCarousel() {
    // Instantiate the Bootstrap carousel
    $('.multi-item-carousel').carousel({
      //interval: false
    });
    // for every slide in carousel, copy the next slide's item in the slide.
    // Do the same for the next, next item.
    $('.multi-item-carousel .item').each(function(){
    var next = $(this).next();
    if (!next.length) {
      next = $(this).siblings(':first');
    }
    next.children(':first-child').clone().appendTo($(this));

    if (next.next().length>0) {
      next.next().children(':first-child').clone().appendTo($(this));
    }
    else {
      $(this).siblings(':first').children(':first-child').clone().appendTo($(this));
    }
  });

  // $('#myCarousel').on('slid', '', checkitem);

  // $(document).ready(function(){
  //   checkitem();
  // });
}

export { organizeCarousel };

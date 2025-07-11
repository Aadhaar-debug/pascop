var carusel = {
    page: 0,
    size: 800,
};

var MARGINS = {
    1: 55,
    2: 35,
    3: 15,
    4: -5,
    5: -25,
    6: -45
}

$(document).ready(function(){

    $(document).on('click', '[data-slide]',function(){
        var page = $(this).attr('data-slide');
        page = parseInt(page) ;
        goToPage(page - 1);
        $('li.active').removeClass('active');
        $(this).closest('li').addClass('active');
    
        initSlides(MARGINS[page] || 0);

    })

    initSlides(MARGINS[1]);


    $('#prev').click(function () {
        carusel.page --;
        if (carusel.page <= 0) {
            carusel.page = 0;            
        }
        animateScroll();
    })

    $('#next').click(function () {
        carusel.page++;
        const count = $('.slide-container .item').length;
        if (carusel.page  >= count) {
            carusel.page = count - 1;
           
        }
        animateScroll();
    })


})

function animateScroll() {
    $('.slide-container').animate({ scrollLeft: carusel.page * carusel.size }, 300);

}

function initSlides(delta) {
    const count = $('.slide-container .item').length - 1;
    $('.slide-container .item').first().css('margin-left', count * carusel.size + delta  + 'px');
}



function goToPage(num){
    carusel.page = num;
    animateScroll();
}

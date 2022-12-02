// Preloader



jQuery(window).load(function() { // makes sure the whole site is loaded

			jQuery('#status').fadeOut(); // will first fade out the loading animation

			jQuery('#preloader').delay(350).fadeOut('slow'); // will fade out the white DIV that covers the website.

			jQuery('body').delay(350).css({'overflow':'visible'});

})



// Scroll to Top

jQuery('.toTop').click(function(){

    //window.scrollTo(0, 0);

    jQuery('html').animate({scrollTop:0}, 'slow');//IE, FF

    jQuery('body').animate({scrollTop:0}, 'slow');//chrome, don't know if Safari works

});



/* HeaderWrap Waypoint

jQuery(document).ready(function() {

	jQuery('.headerWrap').waypoint('sticky');

});

*/



// Menu Drop Down Active

jQuery(document).ready(function() {

    jQuery(".mainMenu li li").mouseenter(function() {

      jQuery(this).parent().parent().addClass("activeMenu");

    });



    jQuery(".mainMenu li li").mouseleave(function() {

      jQuery(this).parent().parent().removeClass("activeMenu");

    });

});













// accordion

jQuery(document).ready(function(jQuery) {

       jQuery('.accordionContent').hide();

       jQuery('.accordionBtn a').click(function(){

          if (jQuery(this).hasClass('selected')) {

              jQuery(this).removeClass('selected');

               jQuery(this).parent().next().slideUp();

          } else {

               jQuery('accordionBtn a').removeClass('selected');

               jQuery(this).addClass('selected');

               jQuery('.accordionContent').slideUp();

               jQuery(this).parent().next().slideDown();

          }

          return false;

       });

});




jQuery(document).ready(function(jQuery) {

       jQuery('.accordionContent').hide();

       jQuery('.accordionBtn .open').click(function(){

          if (jQuery(this).hasClass('selected')) {

              jQuery(this).removeClass('selected');

               jQuery(this).parent().next().slideUp();

          } else {

               jQuery('accordionBtn .open').removeClass('selected');

               jQuery(this).addClass('selected');

               jQuery('.accordionContent').slideUp();

               jQuery(this).parent().next().slideDown();

          }

          return false;

       });

});









/*/ Search Wrap */

jQuery(document).ready(function() {

});



jQuery('.searchIcon').click(function(){

		jQuery('.searchWrap').toggleClass( "searchWrapShow" );

});	

jQuery('.searchClose').click(function(){

		jQuery('.searchWrap').toggleClass( "searchWrapShow" );

});	









jQuery('.AustraliaBtn').click(function(){
		jQuery('.Australia').addClass( "openAustralia" );
		jQuery('.Denmark').removeClass( "openDenmark" );
		jQuery('.India').removeClass( "openIndia" );
		jQuery('.Ireland').removeClass( "openIreland" );
		jQuery('.Italy').removeClass( "openItaly" );
		jQuery('.Mexico').removeClass( "openMexico" );
		jQuery('.Netherlands').removeClass( "openNetherlands" );
		jQuery('.UnitedKingdom').removeClass( "openUnitedKingdom" );
});	


jQuery('.DenmarkBtn').click(function(){
		jQuery('.Australia').removeClass( "openAustralia" );
		jQuery('.Denmark').addClass( "openDenmark" );
		jQuery('.India').removeClass( "openIndia" );
		jQuery('.Ireland').removeClass( "openIreland" );
		jQuery('.Italy').removeClass( "openItaly" );
		jQuery('.Mexico').removeClass( "openMexico" );
		jQuery('.Netherlands').removeClass( "openNetherlands" );
		jQuery('.UnitedKingdom').removeClass( "openUnitedKingdom" );
});	

jQuery('.IndiaBtn').click(function(){
		jQuery('.Australia').removeClass( "openAustralia" );
		jQuery('.Denmark').removeClass( "openDenmark" );
		jQuery('.India').addClass( "openIndia" );
		jQuery('.Ireland').removeClass( "openIreland" );
		jQuery('.Italy').removeClass( "openItaly" );
		jQuery('.Mexico').removeClass( "openMexico" );
		jQuery('.Netherlands').removeClass( "openNetherlands" );
		jQuery('.UnitedKingdom').removeClass( "openUnitedKingdom" );
});	

jQuery('.IrelandBtn').click(function(){
		jQuery('.Australia').removeClass( "openAustralia" );
		jQuery('.Denmark').removeClass( "openDenmark" );
		jQuery('.India').removeClass( "openIndia" );
		jQuery('.Ireland').addClass( "openIreland" );
		jQuery('.Italy').removeClass( "openItaly" );
		jQuery('.Mexico').removeClass( "openMexico" );
		jQuery('.Netherlands').removeClass( "openNetherlands" );
		jQuery('.UnitedKingdom').removeClass( "openUnitedKingdom" );
});	

jQuery('.ItalyBtn').click(function(){
		jQuery('.Australia').removeClass( "openAustralia" );
		jQuery('.Denmark').removeClass( "openDenmark" );
		jQuery('.India').removeClass( "openIndia" );
		jQuery('.Ireland').removeClass( "openIreland" );
		jQuery('.Italy').addClass( "openItaly" );
		jQuery('.Mexico').removeClass( "openMexico" );
		jQuery('.Netherlands').removeClass( "openNetherlands" );
		jQuery('.UnitedKingdom').removeClass( "openUnitedKingdom" );
});	

jQuery('.MexicoBtn').click(function(){
		jQuery('.Australia').removeClass( "openAustralia" );
		jQuery('.Denmark').removeClass( "openDenmark" );
		jQuery('.India').removeClass( "openIndia" );
		jQuery('.Ireland').removeClass( "openIreland" );
		jQuery('.Italy').removeClass( "openItaly" );
		jQuery('.Mexico').addClass( "openMexico" );
		jQuery('.Netherlands').removeClass( "openNetherlands" );
		jQuery('.UnitedKingdom').removeClass( "openUnitedKingdom" );
});	

jQuery('.NetherlandsBtn').click(function(){
		jQuery('.Australia').removeClass( "openAustralia" );
		jQuery('.Denmark').removeClass( "openDenmark" );
		jQuery('.India').removeClass( "openIndia" );
		jQuery('.Ireland').removeClass( "openIreland" );
		jQuery('.Italy').removeClass( "openItaly" );
		jQuery('.Mexico').removeClass( "openMexico" );
		jQuery('.Netherlands').addClass( "openNetherlands" );
		jQuery('.UnitedKingdom').removeClass( "openUnitedKingdom" );
});	


jQuery('.UnitedKingdomBtn').click(function(){
		jQuery('.Australia').removeClass( "openAustralia" );
		jQuery('.Denmark').removeClass( "openDenmark" );
		jQuery('.India').removeClass( "openIndia" );
		jQuery('.Ireland').removeClass( "openIreland" );
		jQuery('.Italy').removeClass( "openItaly" );
		jQuery('.Mexico').removeClass( "openMexico" );
		jQuery('.Netherlands').removeClass( "openNetherlands" );
		jQuery('.UnitedKingdom').addClass( "openUnitedKingdom" );
});	
	
	/*
jQuery('.dropdownBtn').click(function(){
		jQuery('.dropdownHidden').toggleClass( "dropdownHiddenShow" );
});	
	*/












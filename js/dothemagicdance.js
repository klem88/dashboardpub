(function(){
	function dothemagicdance(evt) {
	    var w=$(window).width();
	    var h=$(window).height();

	    if (w > 800)
	    {
	        $('body').removeClass('smallSize');
	    }
	    else if (w < 800)
	    {
	        $('body').addClass('smallSize');
	    }
	}
	console.log('ready');
	$(document).ready(function(){
	    $(window).on('resize',dothemagicdance);
	    dothemagicdance();
	});
}).call(this);
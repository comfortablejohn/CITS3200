var initLocation = [ -31.9688837, 115.9313409 ];
var ready;

ready = function()
{
	var map_canvas = document.getElementById( "map" );
  var map_options = {
    center: new google.maps.LatLng( initLocation[ 0 ], initLocation[ 1 ] ),
    zoom: 11,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL,
      position: google.maps.ControlPosition.TOP_RIGHT
    },
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    panControl: false,
    mapTypeControl: false,
    streetViewControl: false
  }

  var map = new google.maps.Map( map_canvas, map_options )
}

$( document ).ready( ready );
$( document ).on( "page:load", ready );

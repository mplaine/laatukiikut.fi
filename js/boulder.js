var dataSource;
var map;
var data;


// Hide sidebar
document.getElementById( 'sidebar-close' ).addEventListener( 'click', function () {
  document.getElementById( 'sidebar' ).style.display  = 'none';
});

// Initialize Application
function initialize() {
  // Load data from a remote CSV file
  dataSource      = new DataSource( 'data/boulder_2016.csv', initializeMap );
}

// Initialize Google Maps
function initializeMap() {
  // Get loaded data
  data            = dataSource.getData();

  // Initialize the map
  map             = new google.maps.Map( document.getElementById( 'map' ), {
    center: { lat: 65.1939658, lng: 26.6251252 }, // Finland
    zoom: 5
  });

  var bounds = new google.maps.LatLngBounds();

  // Place markers on the map
  var marker;
  var iconBasic   = 'img/boulder_icon_recommended.png';
  var iconTop     = 'img/boulder_icon_highly_recommended.png';
  var infowindow  = new google.maps.InfoWindow();
  var content;
  for ( var i = 0; i < data.length; i++ ) {
    marker        = new google.maps.Marker({
      position: new google.maps.LatLng( data[ i ].Latitude, data[ i ].Longitude ),
      map: map,
      icon: ( data[ i ].Votes > 2 ) ? iconTop : iconBasic
    });
    bounds.extend( marker.getPosition() );

    // Create the info window
    google.maps.event.addListener( marker, 'click', ( function( marker, i ) {
      return function() {
        infowindow.setContent(
          '<div class="marker-info">' +
          '<h3>' + data[ i ].Name + ' (' + data[ i ].Grade + ')' + '</h3>' +
          '<p>' + data[ i ].Crag + ', ' + data[ i ].Area + '</p>' +
          '<p>' + '<a href="' + data[ i ].Url + '" target="_blank">27crags</a>' + '&nbsp;&middot;&nbsp;<a href="https://maps.google.com/maps?saddr=Current+Location&daddr=' + data[ i ].Latitude + '%2C%20' + data[ i ].Longitude + '" target="_blank">Ajo-ohjeet</a>' + '</p>' +
          '</div>'
        );
        infowindow.open( map, marker );
      }
    })( marker, i ));
  }

  // Zoom in/out so that all markers are visible
  map.fitBounds( bounds );
}
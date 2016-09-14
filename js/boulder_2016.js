var dataSource;
var map;
var data;
var TOP_QUALITY_LIMIT  = 6;


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
    zoom: 5,
    minZoom: 4,
    maxZoom: 15,
    styles: [{"featureType":"landscape","stylers":[{"hue":"#FFBB00"},{"saturation":43.400000000000006},{"lightness":37.599999999999994},{"gamma":1}]},{"featureType":"road.highway","stylers":[{"hue":"#FFC200"},{"saturation":-61.8},{"lightness":45.599999999999994},{"gamma":1}]},{"featureType":"road.arterial","stylers":[{"hue":"#FF0300"},{"saturation":-100},{"lightness":51.19999999999999},{"gamma":1}]},{"featureType":"road.local","stylers":[{"hue":"#FF0300"},{"saturation":-100},{"lightness":52},{"gamma":1}]},{"featureType":"water","stylers":[{"hue":"#0078FF"},{"saturation":-13.200000000000003},{"lightness":2.4000000000000057},{"gamma":1}]},{"featureType":"poi","stylers":[{"hue":"#00FF6A"},{"saturation":-1.0989010989011234},{"lightness":11.200000000000017},{"gamma":1}]}]
  });

  var oms         = new OverlappingMarkerSpiderfier( map, { markersWontMove: true, markersWontHide: true, keepSpiderfied: true } );
  var bounds      = new google.maps.LatLngBounds();

  // Place markers on the map
  var marker;
  var iconCluster = 'img/icon_boulder_cluster.png';
  var iconBasic   = 'img/icon_boulder_quality.png';
  var iconTop     = 'img/icon_boulder_top_quality.png';
  var infowindow  = new google.maps.InfoWindow();
  // Global OMS listener
  oms.addListener( 'click', function( marker, event ) {
    infowindow.setContent( marker.content );
    infowindow.open( map, marker );
  });

  var content;
  var markers     = [];
  for ( var i = 0; i < data.length; i++ ) {
    marker        = new google.maps.Marker({
      position: new google.maps.LatLng( data[ i ].Latitude, data[ i ].Longitude ),
      map: map,
      icon: ( data[ i ].Votes >= TOP_QUALITY_LIMIT ) ? iconTop : iconBasic
    });
    marker.content   = getInfoWindowContent( data[ i ] );
    oms.addMarker( marker );
    bounds.extend( marker.getPosition() );
    markers.push( marker );
  }

  // Create a marker cluster
  var markerCluster = new MarkerClusterer( map, markers, { maxZoom: 10, minimumClusterSize: 2, styles: [ { url: iconCluster, height: 40, width: 40, anchor: [ 40, 40 ], textColor: '#000000', textSize: 12 } ] } );

  // Zoom in/out so that all markers are visible
  map.fitBounds( bounds );
}

function getInfoWindowContent( data ) {
  var content       = '';
  var name          = data.Name;
  var grade         = ( data.Grade !== '' ) ? data.Grade : '?';
  var boulder       = name + ' (' + grade + ')';
  var crag          = ( data.Crag !== '' ) ? data.Crag : '';
  var area          = ( data.AreaLevel3 !== '' ) ? data.AreaLevel3 : ( data.AreaLevel2 !== '' ) ? data.AreaLevel2 : data.AreaLevel1;
  area              = ( data.ApproximateLocation === 'Yes' ) ? '<span class="approximate-location">Tuntematon sijainti</span>' : area;
  var location      = ( crag !== '' ) ? crag + ', ' + area : area;
  var linksArray    = [];
  if ( data.Url27crags !== '' ) {
    linksArray.push( '<a href="' + data.Url27crags + '" target="_blank">27crags</a>' );
  }
  if ( data.ApproximateLocation === 'No' ) {
    linksArray.push( '<a href="https://maps.google.com/maps?saddr=Current+Location&daddr=' + data.Latitude + '%2C%20' + data.Longitude + '" target="_blank">Reittiohjeet</a>' );
  }
  if ( data.UrlVideo !== '' ) {
    linksArray.push( '<a href="' + data.UrlVideo + '" target="_blank">Video</a>' );
  }
  if ( data.UrlStory !== '' ) {
    linksArray.push( '<a href="' + data.UrlStory + '" target="_blank">Tarina</a>' );
  }

  var links         = '';
  for ( j = 0; j < linksArray.length; j++ ) {
    links           += linksArray[ j ];
    if ( j < ( linksArray.length - 1 ) ) {
      links         += '&nbsp;&middot;&nbsp;';
    }
  }

  content           =
    '<div class="marker-info">' +
    '<h3>' + boulder + '</h3>' +
    '<p>' + location + '</p>' +
    '<p>' + links + '</p>' +
    '</div>';

  return content;
}
/////////////////////////////////////////////////////////////////////////////
// VARIABLES
/////////////////////////////////////////////////////////////////////////////
var boulders;
var dataSource;
var infoWindow;
var map;
var markerClusterer;
var markers;
var MIN_VOTES_FOR_TOP_QUALITY = 6;
var GRADES                    = [ '?', '1', '2', '3', '4', '4+', '5', '5+', '6A', '6A+', '6B', '6B+', '6C', '6C+', '7A', '7A+', '7B', '7B+', '7C', '7C+', '8A' ];



/////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
/////////////////////////////////////////////////////////////////////////////
// Initialize Application
function initialize() {
  // Load data
  dataSource           = new DataSource({
    callback: initializeMap,
    encoding: 'utf-8',
    file: 'data/boulder_2016.csv',
    header: true
  });
}

// Initialize Google Maps
function initializeMap() {
  // Create a map
  map                  = createMap( document.getElementById( 'map' ) );

  // Get boulders
  boulders             = dataSource.getData();

  // Marker icons
  var icons            = {
    basic:   'img/marker_boulder_basic_quality.png',
    top:     'img/marker_boulder_top_quality.png',
    cluster: 'img/marker_boulder_cluster.png'
  };

  // Create an information window for markers
  infoWindow           = new google.maps.InfoWindow();

  // Create an overlapping marker spiderfier
  var markerSpiderfier = createOverlappingMarkerSpiderfier();
  // Global marker spiderfier listener
  markerSpiderfier.addListener( 'click', function( marker, event ) {
    infoWindow.setContent( marker.content );
    infoWindow.open( map, marker );
  });

  // Create a bounds area object for markers
  var bounds           = new google.maps.LatLngBounds();

  // Hold markers in quality groups
  markers              = {};

  // Create markers
  for ( var i = 0; i < boulders.length; i++ ) {
    var boulder   = boulders[ i ];
    var quality   = ( boulder.Votes >= MIN_VOTES_FOR_TOP_QUALITY ) ? 'top' : 'basic';
    var content   = getInfoWindowContent( boulder );
    var gradeNumber = boulder.GradeSortable;
    var icon      = icons[ quality ];
    var position  = new google.maps.LatLng( boulder.Latitude, boulder.Longitude );
    var zIndex    = ( quality === 'top' ) ? 2 : 1;
    
    // Create an array for each quality group
    if ( quality in markers === false ) {
      markers[ quality ] = [];
    }

    // Create a marker
    var marker         = createMarker( content, gradeNumber, {
      icon:     icon,
      position: position,
      zIndex:   zIndex
    });

    // Add marker to be part of the marker spiderfier
    markerSpiderfier.addMarker( marker );

    // Extend bounds with the marker
    bounds.extend( marker.getPosition() );

    // Assign the marker into a dedicated quality group
    markers[ quality ].push( marker );
  }

  // Create a marker clusterer
  markerClusterer      = createMarkerClusterer( {
    icon: icons.cluster
  });

  // Add all markers to the map
  markerClusterer.addMarkers( markers[ 'basic' ] );
  markerClusterer.addMarkers( markers[ 'top' ] );

  // Zoom map in/out to fit bounds
  map.fitBounds( bounds );
}

function createMap( id ) {
  return new google.maps.Map( id, {
    center: { lat: 65.1939658, lng: 26.6251252 }, // Finland
    maxZoom: 15,
    minZoom: 4,
    // https://snazzymaps.com/style/134/light-dream
    styles: [{'featureType':'landscape','stylers':[{'hue':'#FFBB00'},{'saturation':43.400000000000006},{'lightness':37.599999999999994},{'gamma':1}]},{'featureType':'road.highway','stylers':[{'hue':'#FFC200'},{'saturation':-61.8},{'lightness':45.599999999999994},{'gamma':1}]},{'featureType':'road.arterial','stylers':[{'hue':'#FF0300'},{'saturation':-100},{'lightness':51.19999999999999},{'gamma':1}]},{'featureType':'road.local','stylers':[{'hue':'#FF0300'},{'saturation':-100},{'lightness':52},{'gamma':1}]},{'featureType':'water','stylers':[{'hue':'#0078FF'},{'saturation':-13.200000000000003},{'lightness':2.4000000000000057},{'gamma':1}]},{'featureType':'poi','stylers':[{'hue':'#00FF6A'},{'saturation':-1.0989010989011234},{'lightness':11.200000000000017},{'gamma':1}]}],
    zoom: 5
  });
}

function createMarkerClusterer( options ) {
  return new MarkerClusterer( map, [], {
    maxZoom: 10,
    minimumClusterSize: 3,
    styles: [
      {
        anchor: [ 40, 40 ],
        height: 40,
        textColor: '#000000',
        textSize: 12,
        url: options.icon,
        width: 40
      }
    ]
  });
}

function createOverlappingMarkerSpiderfier() {
  return new OverlappingMarkerSpiderfier( map, {
    markersWontMove: true,
    markersWontHide: true,
    keepSpiderfied: true
  });
}

function createMarker( content, gradeNumber, options ) {
  var marker     = new google.maps.Marker({
    icon: options.icon,
    position: options.position,
    zIndex: options.zIndex
  });
  // Set marker content for the marker spiderfier
  marker.content = content;
  marker.gradeNumber = gradeNumber;

  return marker;
}


function getInfoWindowContent( data ) {
  var content       = '';
  var name          = data.Name;
  var grade         = data.Grade;
  var boulder       = name + ' (' + grade + ')';
  var crag          = ( data.Crag !== '' ) ? data.Crag : '';
  var area          = ( data.AreaLevel3 !== '' ) ? data.AreaLevel3 : ( data.AreaLevel2 !== '' ) ? data.AreaLevel2 : data.AreaLevel1;
  var note          = ( data.ApproximateLocation === 'Yes' ) ? ' <span class="approximate-location">(pääsyherkkä alue)</span>' : '';
  var location      = ( crag !== '' ) ? crag + ', ' + area : area;
  var urls          = [];
  if ( data.Url27crags !== '' ) {
    urls.push( '<a href="' + data.Url27crags + '" target="_blank">27crags</a>' );
  }
  if ( data.ApproximateLocation === 'No' ) {
    urls.push( '<a href="https://maps.google.com/maps?saddr=Current+Location&daddr=' + data.Latitude + '%2C%20' + data.Longitude + '" target="_blank">Reittiohjeet</a>' );
  }
  if ( data.UrlVideo !== '' ) {
    urls.push( '<a href="' + data.UrlVideo + '" target="_blank">Video</a>' );
  }
  if ( data.UrlStory !== '' ) {
    urls.push( '<a href="' + data.UrlStory + '" target="_blank">Tarina</a>' );
  }

  var links         = '';
  for ( j = 0; j < urls.length; j++ ) {
    links           += urls[ j ];
    if ( j < ( urls.length - 1 ) ) {
      links         += '&nbsp;&middot;&nbsp;';
    }
  }

  content           =
    '<div class="marker-info">' +
    '<h3>' + boulder + '</h3>' +
    '<p>' + location + note + '</p>' +
    '<p>' + links + '</p>' +
    '</div>';

  return content;
}


/////////////////////////////////////////////////////////////////////////////
// JQUERY FUNCTIONS
/////////////////////////////////////////////////////////////////////////////
$( '#ex2' ).slider({
  tooltip: 'always',
  step: 1,
  formatter: function( range ) {
    if ( range[ 0 ] === range[ 1 ] ) {
      return GRADES[ range[ 0 ] ];
    }
    else {
      return GRADES[ range[ 0 ] ] + ' - ' + GRADES[ range[ 1 ] ];
    }
  }
});

$( '#ex2' ).on( 'slideStop', function( event ) {
}

$( '#ex2' ).on( 'change', function( event ) {
  var oldValueMin = event.value.oldValue[ 0 ];
  var oldValueMax = event.value.oldValue[ 1 ];
  var newValueMin = event.value.newValue[ 0 ];
  var newValueMax = event.value.newValue[ 1 ];

  if ( oldValueMin !== newValueMin || oldValueMax !== newValueMax ) {
    markerClusterer.clearMarkers();
    // Iterate over basic quality boulders
    for ( var i = 0; i < markers[ 'basic' ].length; i++ ) {
      var marker = markers[ 'basic' ][ i ];
      if ( newValueMin <= marker.gradeNumber && marker.gradeNumber <= newValueMax ) {
        markerClusterer.addMarker( marker );
      }
    }

    if ( newValueMin === newValueMax ) {
      $( '#slaideriarvo' ).text( GRADES[ newValueMax ] );
    }
    else {
      $( '#slaideriarvo' ).text( GRADES[ newValueMin ] + ' - ' + GRADES[ newValueMax ] );
    }
  }
});

//#slaideriarvo

/////////////////////////////////////////////////////////////////////////////
// EVENT LISTENERS
/////////////////////////////////////////////////////////////////////////////
// Add filter listeners
document.getElementById( 'top-quality-filter' ).addEventListener( 'change', function () {
  if ( this.checked === true ) {
    // Add top quality markers to the map
    markerClusterer.addMarkers( markers[ 'top' ] );
  }
  else {
    // Remove top quality markers from the map
    for ( var i = 0; i < markers[ 'top' ].length; i++ ) {
      markerClusterer.removeMarker( markers[ 'top' ][ i ] );
    }
  }
});

document.getElementById( 'basic-quality-filter' ).addEventListener( 'change', function () {
  if ( this.checked === true ) {
    // Add basic quality markers to the map
    markerClusterer.addMarkers( markers[ 'basic' ] );
  }
  else {
    // Remove basic quality markers from the map
    for ( var i = 0; i < markers[ 'basic' ].length; i++ ) {
      markerClusterer.removeMarker( markers[ 'basic' ][ i ] );
    }
  }
});

document.getElementById( 'sidebar-close' ).addEventListener( 'click', function () {
  document.getElementById( 'sidebar' ).style.display  = 'none';
});
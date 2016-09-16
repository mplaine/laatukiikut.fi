/////////////////////////////////////////////////////////////////////////////
// VARIABLES
/////////////////////////////////////////////////////////////////////////////
var boulders;
var dataSource;
var infoWindow;
var map;
var markerClusterer;
var MIN_VOTES_FOR_TOP_QUALITY = 6;
var GRADES                    = [ '?', '1', '2', '3', '4', '4+', '5', '5+', '6A', '6A+', '6B', '6B+', '6C', '6C+', '7A', '7A+', '7B', '7B+', '7C', '7C+', '8A', '8A+', '8B', '8B+', '8C', '8C+', '9A' ];



/////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
/////////////////////////////////////////////////////////////////////////////
// Initialize Application
function initialize() {
  // Load data
  dataSource         = new DataSource({
    callback: initializeMap,
    encoding: 'utf-8',
    file: 'data/boulder_2016.csv',
    header: true
  });
}

// Initialize Google Maps
function initializeMap() {
  // Create a map
  map                = createMap( document.getElementById( 'map' ) );

  // Get boulders
  boulders           = dataSource.getData();

  // Marker icons
  var icons          = {
    basic:   'img/marker_boulder_basic_quality.png',
    top:     'img/marker_boulder_top_quality.png',
    cluster: 'img/marker_boulder_cluster.png'
  };

  // Create an information window for markers
  infoWindow         = new google.maps.InfoWindow();

  // Create an overlapping marker spiderfier
  var markerSpiderfier = createOverlappingMarkerSpiderfier();
  // Global marker spiderfier listener
  markerSpiderfier.addListener( 'click', function( marker, event ) {
    infoWindow.setContent( marker.content );
    infoWindow.open( map, marker );
  });

  // Create a bounds area object for markers
  var bounds         = new google.maps.LatLngBounds();

  // Hold markers
  var markers        = [];

  // Create markers
  for ( var i = 0; i < boulders.length; i++ ) {
    var boulder      = boulders[ i ];
    var quality      = ( boulder.Votes >= MIN_VOTES_FOR_TOP_QUALITY ) ? 'top' : 'basic';
    var content      = getInfoWindowContent( boulder );
    var gradeNumeric = boulder.GradeNumeric;
    var icon         = icons[ quality ];
    var position     = new google.maps.LatLng( boulder.Latitude, boulder.Longitude );
    var zIndex       = ( quality === 'top' ) ? 2 : 1;
    
    // Create a marker
    var marker       = createMarker( content, quality, gradeNumeric, {
      icon:     icon,
      position: position,
      zIndex:   zIndex
    });

    // Extend bounds with the marker
    bounds.extend( marker.getPosition() );

    // Add the marker into the array
    markers.push( marker );

    // Add marker to be part of the marker spiderfier
    markerSpiderfier.addMarker( marker );
  }

  // Create a marker clusterer
  markerClusterer    = createMarkerClusterer( markers, {
    icon: icons.cluster,
    ignoreHidden: true
  });


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

function createMarkerClusterer( markers, options ) {
  return new MarkerClusterer( map, markers, {
    ignoreHidden: options.ignoreHidden,
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
    //markersWontHide: true,
    keepSpiderfied: true
  });
}

function createMarker( content, quality, gradeNumeric, options ) {
  var marker          = new google.maps.Marker({
    icon: options.icon,
    position: options.position,
    zIndex: options.zIndex
  });
  // Set extra properties on the marker
  marker.content      = content;
  marker.quality      = quality;
  marker.gradeNumeric = gradeNumeric;

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
$( '#grade-filter' ).slider({
  tooltip: 'always',
  formatter: function( range ) {
    if ( range[ 0 ] === range[ 1 ] ) {
      return GRADES[ range[ 0 ] ];
    }
    else {
      return GRADES[ range[ 0 ] ] + ' - ' + GRADES[ range[ 1 ] ];
    }
  }
});


/////////////////////////////////////////////////////////////////////////////
// EVENT LISTENERS
/////////////////////////////////////////////////////////////////////////////
$( document ).ready( function() {
  initialize();
});

$( '#grade-filter' ).on( 'change', function( event ) {
  var oldRange    = event.value.oldValue;
  var newRange    = event.value.newValue;

  if ( oldRange[ 0 ] !== newRange[ 0 ] || oldRange[ 1 ] !== newRange[ 1 ] ) {
    var markers = markerClusterer.getMarkers();

    for ( var i = 0; i < markers.length; i++ ) {
      var marker = markers[ i ];

      if ( newRange[ 0 ] <= marker.gradeNumeric && marker.gradeNumeric <= newRange[ 1 ] ) {
        marker.setVisible( true );
      }
      else {
        marker.setVisible( false );        
      }
    }
    markerClusterer.repaint();

    if ( newRange[ 0 ] === newRange[ 1 ] ) {
      $( '#grade-display' ).text( GRADES[ newRange[ 1 ] ] );
    }
    else {
      $( '#grade-display' ).text( GRADES[ newRange[ 0 ] ] + ' - ' + GRADES[ newRange[ 1 ] ] );
    }
  }
});

$( '#top-quality-filter' ).on( 'change', function () {
  var markers = markerClusterer.getMarkers();
  
  for ( var i = 0; i < markers.length; i++ ) {
    var marker = markers[ i ];

    if ( marker.quality === 'top' ) {
      if ( this.checked === true ) {
        marker.setVisible( true );
      }
      else {
        marker.setVisible( false );        
      }
    }
  }
  markerClusterer.repaint();
});

$( '#basic-quality-filter' ).on( 'change', function () {
  var markers = markerClusterer.getMarkers();
  
  for ( var i = 0; i < markers.length; i++ ) {
    var marker = markers[ i ];

    if ( marker.quality === 'basic' ) {
      if ( this.checked === true ) {
        marker.setVisible( true );
      }
      else {
        marker.setVisible( false );        
      }
    }
  }
  markerClusterer.repaint();
});

document.getElementById( 'sidebar-close' ).addEventListener( 'click', function () {
  document.getElementById( 'sidebar' ).style.display  = 'none';
});
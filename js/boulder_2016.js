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
    Basic:   'img/marker_boulder_basic_quality.png',
    Top:     'img/marker_boulder_top_quality.png',
    Cluster: 'img/marker_boulder_cluster.png'
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
    var quality      = ( boulder.Votes >= MIN_VOTES_FOR_TOP_QUALITY ) ? 'Top' : 'Basic';
    var votedBy      = boulder.VotedBy;
    var content      = getInfoWindowContent( boulder );
    var gradeNumeric = boulder.GradeNumeric;
    var icon         = icons[ quality ];
    var position     = new google.maps.LatLng( boulder.Latitude, boulder.Longitude );
    var zIndex       = ( quality === 'Top' ) ? 2 : 1;
    
    // Create a marker
    var marker       = createMarker( content, quality, votedBy, gradeNumeric, {
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
    icon: icons.Cluster,
    ignoreHidden: true
  });
  // Keep track of the number of visible markers. All are visible in the beginning
  $( '#visible-boulder-counter' ).text( markerClusterer.getTotalMarkers() );

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

function createMarker( content, quality, votedBy, gradeNumeric, options ) {
  var marker          = new google.maps.Marker({
    icon: options.icon,
    position: options.position,
    zIndex: options.zIndex
  });
  // Set extra properties on the marker
  marker.content      = content;
  marker.quality      = quality;
  marker.votedBy      = votedBy;
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

function setMarkerVisibility( marker ) {
  // Filter settings
  var gradeRange          = gradeSlider.slider( 'getValue' );
  var topQualityChecked   = $( '#top-quality-filter' ).prop( 'checked' );
  var basicQualityChecked = $( '#basic-quality-filter' ).prop( 'checked' );
  var maleGenderChecked   = $( '#male-gender-filter' ).prop( 'checked' );
  var femaleGenderChecked = $( '#female-gender-filter' ).prop( 'checked' );

  // Marker properties
  var gradeNumeric        = parseInt( marker.gradeNumeric );
  var quality             = marker.quality;
  var votedBy             = marker.votedBy;

  if ( gradeNumeric === 0 || ( gradeRange[ 0 ] <= gradeNumeric && gradeNumeric <= gradeRange[ 1 ] ) ) {
    if ( ( quality === 'Top' && topQualityChecked === true ) || ( quality === 'Basic' && basicQualityChecked === true ) ) {
      if ( ( ( votedBy === 'Male' || votedBy === 'Both' ) && maleGenderChecked === true ) || ( ( votedBy === 'Female' || votedBy === 'Both' ) && femaleGenderChecked === true ) ) {
        marker.setVisible( true );
      }
      else {
        marker.setVisible( false );
      }
    }
    else {
      marker.setVisible( false );
    }
  }
  else {
    marker.setVisible( false );
  }
}

function setVisibleMarkersCounter() {
  var markers = markerClusterer.getMarkers();
  var counter = 0;

  for ( var i = 0; i < markers.length; i++ ) {
    var marker = markers[ i ];

    if ( marker.getVisible() === true ) {
      counter++;
    }
  }

  $( '#visible-boulder-counter' ).text( counter );
}


/////////////////////////////////////////////////////////////////////////////
// JQUERY FUNCTIONS
/////////////////////////////////////////////////////////////////////////////
var gradeSlider = $( '#grade-filter' ).slider({
  tooltip: 'always',
  formatter: function( gradeRange ) {
    var gradeStr;
    if ( gradeRange[ 0 ] === gradeRange[ 1 ] ) {
      gradeStr = GRADES[ gradeRange[ 0 ] ];
    }
    else {
      gradeStr = GRADES[ gradeRange[ 0 ] ] + ' - ' + GRADES[ gradeRange[ 1 ] ];
    }
  
    return gradeStr;
  }
});


/////////////////////////////////////////////////////////////////////////////
// EVENT LISTENERS
/////////////////////////////////////////////////////////////////////////////
$( document ).ready( function() {
  initialize();
});

$( '#grade-filter' ).on( 'change', function( event ) {
  var oldGradeRange         = event.value.oldValue;
  var gradeRange            = event.value.newValue;

  // Grade range has actually changed
  if ( oldGradeRange[ 0 ] !== gradeRange[ 0 ] || oldGradeRange[ 1 ] !== gradeRange[ 1 ] ) {
    // Close information window
    infoWindow.close();

    var markers             = markerClusterer.getMarkers();
    for ( var i = 0; i < markers.length; i++ ) {
      setMarkerVisibility( markers[ i ] );
    }

    markerClusterer.repaint();
    setVisibleMarkersCounter();

    if ( gradeRange[ 0 ] === gradeRange[ 1 ] ) {
      $( '#grade-display' ).text( GRADES[ gradeRange[ 1 ] ] );
    }
    else {
      $( '#grade-display' ).text( GRADES[ gradeRange[ 0 ] ] + ' - ' + GRADES[ gradeRange[ 1 ] ] );
    }
  }
});

$( '#top-quality-filter' ).on( 'change', function () {
  // Close information window
  infoWindow.close();

  var markers = markerClusterer.getMarkers();
  for ( var i = 0; i < markers.length; i++ ) {
    setMarkerVisibility( markers[ i ] );
  }

  markerClusterer.repaint();
  setVisibleMarkersCounter();
});

$( '#basic-quality-filter' ).on( 'change', function () {
  // Close information window
  infoWindow.close();

  var markers        = markerClusterer.getMarkers();
  for ( var i = 0; i < markers.length; i++ ) {
    setMarkerVisibility( markers[ i ] );
  }

  markerClusterer.repaint();
  setVisibleMarkersCounter();
});

$( '#male-gender-filter' ).on( 'change', function () {
  // Close information window
  infoWindow.close();

  var markers = markerClusterer.getMarkers();
  for ( var i = 0; i < markers.length; i++ ) {
    setMarkerVisibility( markers[ i ] );
  }

  markerClusterer.repaint();
  setVisibleMarkersCounter();
});

$( '#female-gender-filter' ).on( 'change', function () {
  // Close information window
  infoWindow.close();

  var markers        = markerClusterer.getMarkers();
  for ( var i = 0; i < markers.length; i++ ) {
    setMarkerVisibility( markers[ i ] );
  }

  markerClusterer.repaint();
  setVisibleMarkersCounter();
});

document.getElementById( 'sidebar-close' ).addEventListener( 'click', function () {
  document.getElementById( 'sidebar' ).style.display  = 'none';
});
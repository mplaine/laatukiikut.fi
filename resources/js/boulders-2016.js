// Laatukiikut - Boulders 2016 module
// Uses the revealing module pattern: https://medium.freecodecamp.com/javascript-modules-a-beginner-s-guide-783f7d7a5fcc#.7ndsmfkci
var boulders2016 = ( function () {


  ////////////////////////////////////////////////////////////////////////////
  // PRIVATE VARIABLES
  ////////////////////////////////////////////////////////////////////////////
  // Finals
  var MIN_VOTES_FOR_TOP_QUALITY = 6;
  var GRADES                    = [ '?', '1', '2', '3', '4', '4+', '5', '5+', '6A', '6A+', '6B', '6B+', '6C', '6C+', '7A', '7A+', '7B', '7B+', '7C', '7C+', '8A', '8A+', '8B', '8B+', '8C', '8C+', '9A' ];
  var DATA_URL                  = '/resources/data/boulders-2016.csv';
  var DATA_ENCODING             = 'utf-8';
  var DATA_HEADER               = true;
  var MARKER_BASIC_QUALITY_URL  = '/resources/images/markers/marker-basic-quality.png';
  var MARKER_TOP_QUALITY_URL    = '/resources/images/markers/marker-top-quality.png';
  var MARKER_CLUSTER_URL        = '/resources/images/markers/marker-cluster.png';
  var MARKER_ICONS              = {
    Basic:   MARKER_BASIC_QUALITY_URL,
    Top:     MARKER_TOP_QUALITY_URL,
    Cluster: MARKER_CLUSTER_URL
  };

  // UI components
  var votesSlider;
  var gradeSlider;

  // UI component states
  var votesSliderState;
  var gradeSliderState;
  var maleButtonState;
  var femaleButtonState;

  // Data
  var dataSource;
  var data;

  // Google Maps
  var map;
  var infoWindow;
  var markerClusterer;


  ////////////////////////////////////////////////////////////////////////////
  // PRIVATE FUNCTIONS
  ////////////////////////////////////////////////////////////////////////////
  // Initialize the application
  var initializeApplication = function () {
    // Load data
    var dataSourceOptions = {
      callback: dataLoadComplete,
      encoding: DATA_ENCODING,
      file:     DATA_URL,
      header:   DATA_HEADER
    };
    dataSource            = new DataSource( dataSourceOptions );
  };


  // Data load complete handler
  var dataLoadComplete = function () {
    // Get data
    data = dataSource.getData();

    // Initialize Google Maps
    initializeGoogleMaps();
  };


  // Initialize the Google Maps
  var initializeGoogleMaps = function () {
    // Create a map
    var mapOptions             = {
      // Finland
      center: {
        lat:   65.1939658,
        lng:   26.6251252
      },
      maxZoom: 15,
      minZoom: 4,
      // https://snazzymaps.com/style/72901/yellow
      styles:  [{'featureType':'administrative','elementType':'labels.text.fill','stylers':[{'color':'#444444'}]},{'featureType':'landscape','elementType':'all','stylers':[{'color':'#f2f2f2'}]},{'featureType':'poi','elementType':'all','stylers':[{'visibility':'off'}]},{'featureType':'road','elementType':'all','stylers':[{'saturation':-100},{'lightness':45}]},{'featureType':'road.highway','elementType':'all','stylers':[{'visibility':'simplified'}]},{'featureType':'road.highway','elementType':'geometry.fill','stylers':[{'color':'#ffd400'}]},{'featureType':'road.arterial','elementType':'geometry.fill','stylers':[{'hue':'#ff0000'}]},{'featureType':'road.arterial','elementType':'labels.icon','stylers':[{'visibility':'off'}]},{'featureType':'road.local','elementType':'geometry.fill','stylers':[{'color':'#ffffff'}]},{'featureType':'transit','elementType':'all','stylers':[{'visibility':'off'}]},{'featureType':'water','elementType':'all','stylers':[{'color':'#c2c4c4'},{'visibility':'on'}]}],
      zoom: 5
    };
    map                        = new google.maps.Map( document.getElementById( 'content-map' ), mapOptions );

    // Create an information window for markers
    infoWindow                 = new google.maps.InfoWindow();

    // Create an overlapping marker spiderfier for handling overlapping markers
    var omsOptions             = {
      markersWontMove: true,
      //markersWontHide: true,
      keepSpiderfied:  true
    };
    var oms                    = new OverlappingMarkerSpiderfier( map, omsOptions );
    // OMS' leg colors
    var mapTypeId  = google.maps.MapTypeId;
    oms.legColors.usual[ mapTypeId.SATELLITE ]       = '#FFFFFF';
    oms.legColors.highlighted[ mapTypeId.SATELLITE ] = '#F1C40F';
    oms.legColors.usual[ mapTypeId.HYBRID ]          = '#FFFFFF';
    oms.legColors.highlighted[ mapTypeId.HYBRID ]    = '#F1C40F';
    oms.legColors.usual[ mapTypeId.TERRAIN ]         = '#777777';
    oms.legColors.highlighted[ mapTypeId.TERRAIN ]   = '#2C2C2C';
    oms.legColors.usual[ mapTypeId.ROADMAP ]         = '#777777';
    oms.legColors.highlighted[ mapTypeId.ROADMAP ]   = '#2C2C2C';
    // Attach event listener
    oms.addListener( 'click', function( marker, event ) {
      infoWindow.setContent( marker.content );
      infoWindow.open( map, marker );
    });

    // Create a bounds area object for markers
    var bounds                 = new google.maps.LatLngBounds();
    // Create markers
    var markers                = [];
    for ( var i = 0; i < data.length; i++ ) {
      var boulder              = data[ i ];
      var votes                = boulder.Votes;
      var quality              = ( boulder.Votes >= MIN_VOTES_FOR_TOP_QUALITY ) ? 'Top' : 'Basic';
      var votedBy              = boulder.VotedBy;
      var content              = getInfoWindowContent( boulder );
      var gradeNumeric         = boulder.GradeNumeric;
      var icon                 = MARKER_ICONS[ quality ];
      var position             = new google.maps.LatLng( boulder.Latitude, boulder.Longitude );
      var zIndex               = ( quality === 'Top' ) ? 2 : 1;

      // Create a marker
      var markerOptions        = {
        icon:     icon,
        position: position,
        zIndex:   zIndex
      };
      var marker               = new google.maps.Marker( markerOptions );
      // Set extra properties for the marker
      marker.content           = content;
      marker.votes             = votes;
      marker.quality           = quality;
      marker.votedBy           = votedBy;
      marker.gradeNumeric      = gradeNumeric;
      // Extend bounds with the marker
      bounds.extend( marker.getPosition() );
      // Add the marker into the array
      markers.push( marker );
      // Add marker to be part of the marker spiderfier
      oms.addMarker( marker );
    }

    // Create a marker clusterer (plus)
    var markerClustererOptions = {
      ignoreHidden:       true,
      maxZoom:            10,
      minimumClusterSize: 3,
      styles: [
        {
          anchor:         [ 40, 40 ],
          height:         40,
          textColor:      '#2C2C2C',
          textSize:       12,
          url:            MARKER_ICONS.Cluster,
          width:          40
        }
      ]
    };
    markerClusterer            = new MarkerClusterer( map, markers, markerClustererOptions );

    // Update the visible markers counter UI component
    $( '#visible-markers-counter' ).text( markerClusterer.getTotalMarkers() );

    // Fit the map within the bounds of markers
    map.fitBounds( bounds );

    // Create a slider UI component for votes
    votesSlider                = document.getElementById( 'slider-votes' );
    var votesSliderOptions     = {
      start:    [ 1 ],
      connect:  'upper',
      tooltips: wNumb({ decimals: 0 }),
      format:   wNumb({ decimals: 0 }),
      range: {
        min:    [ 1 ],
        max:    [ 7 ]
      }
    };
    noUiSlider.create( votesSlider, votesSliderOptions );
    // Create a slider UI component for grade
    gradeSlider                = document.getElementById( 'slider-grade' );
    var gradeSliderOptions     = {
      start:    [ 7, 20 ],
      connect:  true,
      tooltips: [ wNumb({ decimals: 0, edit: function( value ) { return GRADES[ value ]; } }), wNumb({ decimals: 0, edit: function( value ) { return GRADES[ value ]; } }) ],
      format:   wNumb({ decimals: 0 }),
      range: {
        min:    [ 7 ],
        max:    [ 20 ]
      }
    };
    noUiSlider.create( gradeSlider, gradeSliderOptions );

    // Initialize UI components' states
    votesSliderState            = votesSlider.noUiSlider.get();
    gradeSliderState            = gradeSlider.noUiSlider.get();
    maleButtonState             = true;
    femaleButtonState           = true;

    // Add event listeners
    addEventListeners();

    // Show the About view on the very first visit (for UX and used only if local storage is supported)
    if ( testLocalStorageSupport() === true ) {
      if ( localStorage.getItem( 'aboutShown' ) === null ) {
        localStorage.setItem( 'aboutShown', 'true' );
        $( '#content-about-collapse' ).collapse( 'show' );
      }
    }
  };


  // Get information window content
  var getInfoWindowContent = function( data ) {
    var content  = '';
    var name     = data.Name;
    var grade    = data.Grade;
    var boulder  = name + ' (' + grade + ')';
    var crag     = ( data.Crag !== '' ) ? data.Crag : '';
    var area     = ( data.AreaLevel3 !== '' ) ? data.AreaLevel3 : ( data.AreaLevel2 !== '' ) ? data.AreaLevel2 : data.AreaLevel1;
    var weather  = ( data.AreaLevel3 !== '' ) ? data.AreaLevel3 : ( data.AreaLevel2 !== '' ) ? data.AreaLevel2 : '';
    var note     = ( data.ApproximateLocation === 'Yes' ) ? ' <span class="approximate-location">(pääsyherkkä alue)</span>' : '';
    var location = ( crag !== '' ) ? crag + ', ' + area : area;
    var urls     = [];
    if ( data.UrlVideo !== '' ) {
      urls.push( '<a href="' + data.UrlVideo + '" target="_blank">Video</a>' );
    }
    if ( data.UrlStory !== '' ) {
      urls.push( '<a href="' + data.UrlStory + '" target="_blank">Tarina</a>' );
    }
    if ( data.Url27crags !== '' ) {
      urls.push( '<a href="' + data.Url27crags + '" target="_blank">27crags</a>' );
    }
    if ( weather !== '' ) {
      urls.push( '<a href="http://ilmatieteenlaitos.fi/saa/' + encodeURIComponent( weather ) + '" target="_blank">Sää</a>' );
    }
    if ( data.ApproximateLocation === 'No' ) {
      urls.push( '<a href="https://www.google.fi/maps?saddr=Current+Location&daddr=' + data.Latitude + '%2C%20' + data.Longitude + '" target="_blank">Reittiohjeet</a>' );
    }

    var links    = '';
    for ( j = 0; j < urls.length; j++ ) {
      links      += urls[ j ];
      if ( j < ( urls.length - 1 ) ) {
        links    += '&nbsp;&middot;&nbsp;';
      }
    }

    content      =
      '<div class="marker-info">' +
        '<h4>' + boulder + '</h4>' +
        '<p class="location"><span class="icon-location" aria-hidden="true"></span> ' + location + note + '</p>' +
        '<p class="links">' + links + '</p>' +
      '</div>';

    return content;
  };


  // Update marker visibility
  var updateMarkerVisibility = function( marker ) {
    // Read marker properties
    var gradeNumeric = parseInt( marker.gradeNumeric );
    var votes        = marker.votes;
    var quality      = marker.quality;
    var votedBy      = marker.votedBy;

    if ( gradeNumeric === 0 || ( gradeSliderState[ 0 ] <= gradeNumeric && gradeNumeric <= gradeSliderState[ 1 ] ) ) {
      if ( votesSliderState <= votes ) {
        if ( ( ( votedBy === 'Male' || votedBy === 'Both' ) && maleButtonState === true ) || ( ( votedBy === 'Female' || votedBy === 'Both' ) && femaleButtonState === true ) ) {
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

    return ( marker.getVisible() === true ) ? 1 : 0;
  };


  // Test the browser's local storage support
  var testLocalStorageSupport = function () {
    var str       = 'test';
    var supported = false;

    try {
      localStorage.setItem( str, str );
      localStorage.removeItem( str );
      supported   = true;
    } catch( e ) {
      supported   = false;
    }

    return supported;
  };


  // Add UI component event listeners
  var addEventListeners = function () {
    // Attach an event listener for the votes slider UI component
    votesSlider.noUiSlider.on( 'update', function() {
      var votesSliderValue = votesSlider.noUiSlider.get();

      // Update only if the value actually changes while dragging (constant repainting makes markers to flash)
      if ( votesSliderState !== votesSliderValue ) {
        // Update votes slider state
        votesSliderState        = votesSliderValue;

        // Close information window
        infoWindow.close();

        var counter             = 0;
        var markers             = markerClusterer.getMarkers();
        for ( var i = 0; i < markers.length; i++ ) {
            counter             += updateMarkerVisibility( markers[ i ] );
        }

        markerClusterer.repaint();
        $( '#visible-markers-counter' ).text( counter );
      }
    });

    // Attach an event listener for the grade slider UI component
    gradeSlider.noUiSlider.on( 'update', function() {
      var gradeSliderValue     = gradeSlider.noUiSlider.get();

      // Update only if either of the values actually changes while dragging (constant repainting makes markers to flash)
      if ( gradeSliderState[ 0 ] !== gradeSliderValue[ 0 ] || gradeSliderState[ 1 ] !== gradeSliderValue[ 1 ] ) {
        // Update grade slider state
        gradeSliderState       = gradeSliderValue;

        // Close information window
        infoWindow.close();

        var counter             = 0;
        var markers             = markerClusterer.getMarkers();
        for ( var i = 0; i < markers.length; i++ ) {
          counter               += updateMarkerVisibility( markers[ i ] );
        }

        markerClusterer.repaint();
        $( '#visible-markers-counter' ).text( counter );
      }
    });

    // Attach an event listener for the male button UI component
    $( '#btn-male' ).on( 'click', function () {
      if ( maleButtonState === true ) {
        maleButtonState = false;
        $( '#btn-male' ).removeClass( 'btn-checked' );
      }
      else {
        maleButtonState = true;
        $( '#btn-male' ).addClass( 'btn-checked' );
      }

      // Close information window
      infoWindow.close();

      var counter             = 0;
      var markers             = markerClusterer.getMarkers();
      for ( var i = 0; i < markers.length; i++ ) {
        counter               += updateMarkerVisibility( markers[ i ] );
      }

      markerClusterer.repaint();
      $( '#visible-markers-counter' ).text( counter );
    });

    // Attach an event listener for the female button UI component
    $( '#btn-female' ).on( 'click', function () {
      if ( femaleButtonState === true ) {
        femaleButtonState = false;
        $( '#btn-female' ).removeClass( 'btn-checked' );
      }
      else {
        femaleButtonState = true;
        $( '#btn-female' ).addClass( 'btn-checked' );
      }

      // Close information window
      infoWindow.close();

      var counter             = 0;
      var markers             = markerClusterer.getMarkers();
      for ( var i = 0; i < markers.length; i++ ) {
        counter               += updateMarkerVisibility( markers[ i ] );
      }

      markerClusterer.repaint();
      $( '#visible-markers-counter' ).text( counter );
    });

    // Attach event listeners for the collapse content about UI component
    $( '#content-about-collapse' ).on( 'show.bs.collapse', function() {
      // First, reset the other collapse content
      $( '#content-filters-collapse' ).collapse( 'hide' );
      $( '#btn-filters' ).removeClass( 'btn-collapsing' );
      $( '#btn-filters > span' ).addClass( 'icon-filters' ).removeClass( 'icon-close' );

      $( '#btn-about' ).addClass( 'btn-collapsing' );
      $( '#btn-about > span' ).addClass( 'icon-close' ).removeClass( 'icon-about' );
    });
    $( '#content-about-collapse' ).on( 'shown.bs.collapse', function() {
      $( '#btn-about' ).addClass( 'in' ).removeClass( 'btn-collapsing' );
    });
    $( '#content-about-collapse' ).on( 'hide.bs.collapse', function () {
      $( '#btn-about' ).addClass( 'btn-collapsing' ).removeClass( 'in' );
    });
    $( '#content-about-collapse' ).on( 'hidden.bs.collapse', function () {
      $( '#btn-about' ).removeClass( 'btn-collapsing' );
      $( '#btn-about > span' ).addClass( 'icon-about' ).removeClass( 'icon-close' );
    });

    // Attach event listeners for the collapse content filters UI component
    $( '#content-filters-collapse' ).on( 'show.bs.collapse', function() {
      // First, reset the other collapse content
      $( '#content-about-collapse' ).collapse( 'hide' );
      $( '#btn-about' ).removeClass( 'btn-collapsing' );
      $( '#btn-about > span' ).addClass( 'icon-about' ).removeClass( 'icon-close' );

      $( '#btn-filters' ).addClass( 'btn-collapsing' );
      $( '#btn-filters > span' ).addClass( 'icon-close' ).removeClass( 'icon-filters' );
    });
    $( '#content-filters-collapse' ).on( 'shown.bs.collapse', function() {
      $( '#btn-filters' ).addClass( 'in' ).removeClass( 'btn-collapsing' );
    });
    $( '#content-filters-collapse' ).on( 'hide.bs.collapse', function () {
      $( '#btn-filters' ).addClass( 'btn-collapsing' ).removeClass( 'in' );
    });
    $( '#content-filters-collapse' ).on( 'hidden.bs.collapse', function () {
      $( '#btn-filters' ).removeClass( 'btn-collapsing' );
      $( '#btn-filters > span' ).addClass( 'icon-filters' ).removeClass( 'icon-close' );
    });
  };


  ////////////////////////////////////////////////////////////////////////////
  // PUBLIC API
  ////////////////////////////////////////////////////////////////////////////
  return {
    init: initializeApplication
  }


})();


// Initialize the application on document ready
$( document ).ready( function() {
  // Initialize the application
  boulders2016.init();
});
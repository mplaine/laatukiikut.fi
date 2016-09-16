// Constructors
var DataSource  = function( options ) {
  this.data     = [];
  this.loaded   = options.callback;

  // Load csv data
  var that      = this;
  Papa.parse( options.file, {
    complete: function( results ) {
      that.data = results.data;
      that.loaded();
    },
    download: true,
    encoding: options.encoding,
    header: options.header
  });
};

// Methods
DataSource.prototype.getData  = function() {
  return this.data;
};
// Constructors
var DataSource  = function( file, loaded ) {
  this.data     = [];
  this.loaded   = loaded;

  // Load csv data
  var that      = this;
  Papa.parse( file, {
    complete: function( results ) {
      that.data = results.data;
      that.loaded();
    },
    download: true,
    encoding: "utf-8",
    header: true
  });
};

// Methods
DataSource.prototype.getData  = function() {
  return this.data;
};
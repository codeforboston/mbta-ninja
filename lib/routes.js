// Main route
Router.route('/', function() {
  this.render('landing');
},{
  name : 'landing'
});

Router.route('/map', function() {
  this.render('landing');
},{
  name : 'map'
});

// Route for each individual line
Router.route(
  '/lines/:type/:line',
  function() {
    this.render('main');
  },
  {
    name: 'line.show'
  }
);

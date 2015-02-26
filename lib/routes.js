// Main route
Router.route('/', function() {
  this.render('landing');
});

// Route for each individual line
Router.route(
  '/lines/:line',
  function() {
    this.render('main');
  },
  {
    name: 'line.show'
  }
);

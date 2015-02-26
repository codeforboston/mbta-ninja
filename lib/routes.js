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

// After route hook
Router.onAfterAction(function() {
  $('body,html').scrollTop(0); //jump to the top of the view, so you don't end up halfway down the page w/ no explanation
});

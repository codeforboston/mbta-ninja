Meteor.subscribe('reports');

Template.main.helpers({
  stations: function () {
    return currentStations();
  },
  currentLine: function() {
    return currentLine();
  },
  noReports: function() {
    return numReports(currentLine()) === 0;
  },
  numReports: function() {
    return numReports(currentLine());
  },
  lineColor: function() {
    var line = currentLine();
    var lineColor = '';

    if (line.indexOf('Red') > -1) {
      lineColor = 'red-line';
    }
    else if (line.indexOf('Green') > -1) {
      lineColor = 'green-line';
    }
    else if (line.indexOf('Orange') > -1) {
      lineColor = 'orange-line';
    }
    else if (line.indexOf('Blue') > -1) {
      lineColor = 'blue-line';
    }
    else if (line.indexOf('Needham') > -1) {
      lineColor = 'purple-line';
    }
    else if (line.indexOf('Fitchburg') > -1) {
      lineColor = 'purple-line';
    }
    else if (line.indexOf('Worcester') > -1) {
      lineColor = 'purple-line';
    }
    else if (line.indexOf('Fairmount') > -1) {
      lineColor = 'purple-line';
    }

    return lineColor;
  }
});

Template.main.rendered = function() {
  // Enable modal triggering with + button
  $('.modal-trigger').leanModal();

  setInterval(function(){
    var currentTime = moment().format('hh:mm:ss');
    $('#current-time').text(currentTime);
  }, 1000);
};

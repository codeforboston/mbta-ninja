Meteor.subscribe("reports");

Template.createReport.helpers({
  stations: function () {
    return currentStations();
  },
  reportTypes: function() {
    return reportTypes[currentTransitType()];
  }
});

Template.createReport.events({
  'click .submit': function() {
    // Gather imputs from form
    var nameInput = $('#nameInput');
    var name = nameInput.val();
    var locationInput = $('#locationInput');
    var location = locationInput.val();
    var line = currentLine();

    // Does a similar report already exist?
    var existingReport = Reports.findOne({
      name: name,
      location: location,
      line: line
    });

    // If so and we can upvote, we do
    if (existingReport) {
      if(canUpvote(existingReport._id)) {
        Meteor.call("upvoteReport", existingReport._id);
        // Avoid future upvotes
        Session.setPersistent(existingReport._id, 'upvoted');
      }
    } else { // Create a new report
      Meteor.call("saveReport", name, location, line, function(err, report) {
        // Avoid future upvotes
        Session.setPersistent(report, 'created');
      });
    }
    toast("Thanks for your report!", 2000);
  }
});

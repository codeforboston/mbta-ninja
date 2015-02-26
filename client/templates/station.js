Meteor.subscribe("reports");

Template.station.helpers({
  reports: function() {
    return Reports.find({
      location: this.name,
      line: currentLine(),
      expired: false
    });
  }
});

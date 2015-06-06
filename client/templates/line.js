Meteor.subscribe('reports');

Template.line.helpers({
  numberReports: function() {
    return Reports.find({
      expired: false,
      line: this.path
    }).count();
  },
  lineAlerts: function(){
    var directions = this.directions;
    for (var i = 0; i < directions.length; i++) {
      var path = directions[i].path
      var path_reports = Reports.find({
        expired: false,
        line: path
      }).count();
      if (path_reports) {
        return true
      }
    };
  }
});

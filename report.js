Reports = new Mongo.Collection('reports');

function Report(name, location, line, votes, clears, createdAt, lastConfirmedAt) {
  this.name = name;
  this.location = location;
  this.line = line;
  this.votes = votes;
  this.clears = clears;
  this.createdAt = createdAt;
  this.lastConfirmedAt = lastConfirmedAt;
}

Report.prototype = {
  save: function() {
    var docId = Reports.findOne({
      name: this.name,
      location: this.location,
      line: this.line,
      expired: false
    });

    if (docId) { // Upvote
      if (Session.get(docId._id) == null) { // Can upvote
        // Avoid future upvotes
        Session.setPersistent(docId._id, 'upvoted');
        return Reports.update(docId._id, {$inc: {votes: 1}});
      }
    } else { // Create
      var newReport =  Reports.insert({
        name: this.name,
        location: this.location,
        line: this.line,
        votes: this.votes,
        clears: this.clears,
        createdAt: this.createdAt,
        lastConfirmedAt: this.lastConfirmedAt,
        expired: false
      });
      // Avoid user to upvote her own report
      Session.setPersistent(newReport, 'created');
      return newReport;
    }
  }
};

if (Meteor.isClient) {
  var reportTypes = [
    {name: 'Delayed train'},
    {name: 'Train too crowded to board'},
    {name: 'Overcrowded platform'},
    {name: 'Overcrowded train'},
    {name: 'Train stopped between stations'},
    {name: 'Disabled train'},
    {name: 'Medical emergency'},
    {name: 'Normal conditions'}
  ];

  var stations = [
    {name: 'Alewife'},
    {name: 'Davis'},
    {name: 'Porter Square'},
    {name: 'Harvard Square'},
    {name: 'Central Square'},
    {name: 'Kendall'},
    {name: 'Charles/MGH'},
    {name: 'Park Street'},
    {name: 'Downtown Crossing'},
    {name: 'South Station'},
    {name: 'Broadway'},
    {name: 'Andrew'},
    {name: 'JFK/UMass'},
    {name: 'North Quincy'},
    {name: 'Wollaston'},
    {name: 'Quincy Center'},
    {name: 'Quincy Adams'},
    {name: 'Braintree'},
    {name: 'Savin Hill'},
    {name: 'Fields Corner'},
    {name: 'Shawmut'},
    {name: 'Ashmont'}
  ];

  // HELPERS
  var numReports = function(line) {
    return Reports.find({
      line: currentLine(),
      name: {$ne: 'Normal conditions'},
      expired: false
    }).count();
  };

  Template.main.helpers({
    noReports: function() {
      return numReports(currentLine()) === 0;
    },
    numReports: function() {
      return numReports(currentLine());
    }
  });

  Template.createReport.helpers({
    stations: stations,
    stationsWithBetween: stationsWithBetween,
    reportTypes: reportTypes
  });

  Template.report.helpers({
    canUpvote: function() {
      return Session.get(this._id) == null;
    },

    positive: function(reportName) {
      return (reportName === 'Normal conditions');
    }
  });

  var stationsWithBetween = function() {
    var result = [];
    for (var i = 0; i < stations.length; i++) {
      result.push(stations[i]);
      if (i != stations.length - 1) {
        var between = {
          name: stations[i].name + ' ~ ' + stations[i + 1].name
        };
        result.push(between);
      }
    }
    return result;
  };

  var currentLine = function() {
    return Router.current().params.line;
  };

  Template.main.helpers({
    stations: stations,
    currentLine: function() {
      return currentLine();
    }
  });

  Template.station.helpers({
    reports: function() {
      return Reports.find({
        location: this.name,
        line: currentLine(),
        expired: false
      });
    }
  });

  // EVENTS
  Template.createReport.events({
    'click .submit': function() {
      var nameInput = $('#nameInput');
      var name = nameInput.val();

      var locationInput = $('#locationInput');
      var location = locationInput.val();

      var votes = 0;
      var clears = 0;
      var line = currentLine();

      newReport = new Report(
        name,
        location,
        line,
        votes,
        clears,
        new Date(),
        new Date()
      ).save();
      console.log(Reports.find({}).fetch());
    }
  });

  Template.report.events({
    // Upvote the current event
    'click .upvote': function() {
      if (!Session.get(this._id)) {
        Reports.update(this._id, {$inc: {votes: 1}});
        Reports.update(this._id, {$set: {lastConfirmedAt: new Date()}});
        Session.setPersistent(this._id, 'upvoted');
      } else { console.log('Cannot upvote again!'); }
    },
    'click .downvote': function() {
      if (!Session.get(this._id)) {
        Reports.update(this._id, {$inc: {clears: 1}});
        Reports.update(this._id, {$set: {lastClearedAt: new Date()}});
        Session.setPersistent(this._id, 'downvoted');
      } else { console.log('Cannot downvote again!'); }
    }
  });
}

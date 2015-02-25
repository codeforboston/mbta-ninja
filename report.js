Reports = new Mongo.Collection('reports');

// Decay variables
var initialWeight = 20;
var upvoteWeight = 10;
var downvoteWeight = -5;

function Report(name, location, line, votes, clears, createdAt, lastConfirmedAt, expired, weight) {
  this.name = name;
  this.location = location;
  this.line = line;
  this.votes = votes;
  this.clears = clears;
  this.createdAt = createdAt;
  this.lastConfirmedAt = lastConfirmedAt;
  this.expired = expired;
  this.weight = weight;
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
        Reports.update(docId._id, {$inc: {votes: 1}});
        Reports.update(docId._id, {$inc: {weight: upvoteWeight}});
        return Reports.update(docId._id, {$set: {lastConfirmedAt: new Date()}});
      }
    } else { // Create
      var newReport =  Reports.insert({
        name: this.name,
        location: this.location,
        line: this.line,
        votes: 0,
        clears: 0,
        createdAt: new Date(),
        lastConfirmedAt: new Date(),
        expired: false,
        weight: initialWeight
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

  var stations = {
    "Red Line - Northbound": [
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
    ],
    "Red Line - Southbound": [
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
    ],
    "Orange Line - Northbound": [
      {name: "Oak Grove"},
      {name: "Malden Center"},
      {name: "Wellington"},
      {name: "Assembly"},
      {name: "Sullivan Square"},
      {name: "Community College"},
      {name: "North Station"},
      {name: "Haymarket"},
      {name: "State Street"},
      {name: "Downtown Crossing"},
      {name: "Chinatown"},
      {name: "Tufts Medical Center"},
      {name: "Back Bay"},
      {name: "Massachusetts Ave."},
      {name: "Ruggles"},
      {name: "Roxbury Crossing"},
      {name: "Jackson Square"},
      {name: "Stony Brook"},
      {name: "Green Street"},
      {name: "Forest Hills"}
    ],
    "Orange Line - Southbound": [
      {name: "Oak Grove"},
      {name: "Malden Center"},
      {name: "Wellington"},
      {name: "Assembly"},
      {name: "Sullivan Square"},
      {name: "Community College"},
      {name: "North Station"},
      {name: "Haymarket"},
      {name: "State Street"},
      {name: "Downtown Crossing"},
      {name: "Chinatown"},
      {name: "Tufts Medical Center"},
      {name: "Back Bay"},
      {name: "Massachusetts Ave."},
      {name: "Ruggles"},
      {name: "Roxbury Crossing"},
      {name: "Jackson Square"},
      {name: "Stony Brook"},
      {name: "Green Street"},
      {name: "Forest Hills"}
    ],
    "Green Line B - Westbound": [
      {name: "Lechmere"},
      {name: "Science Park"},
      {name: "North Station"},
      {name: "Haymarket"},
      {name: "Park Street"},
      {name: "Boylston"},
      {name: "Arlington"},
      {name: "Copley"},
      {name: "Hynes Convention Center"},
      {name: "Kenmore"},
      {name: "Blandford Street"},
      {name: "Boston Univ. East"},
      {name: "Boston Univ. Central"},
      {name: "Boston Univ. West"},
      {name: "Saint Paul Street"},
      {name: "Pleasant Street"},
      {name: "Babcock Street"},
      {name: "Packards Corner"},
      {name: "Harvard Ave."},
      {name: "Griggs Street"},
      {name: "Allston Street"},
      {name: "Warren Street"},
      {name: "Washington Street"},
      {name: "Sutherland Road"},
      {name: "Chiswick Road"},
      {name: "Chestnut Hill Ave."},
      {name: "South Street"},
      {name: "Boston College"}
    ],
    "Green Line B - Eastbound": [
      {name: "Lechmere"},
      {name: "Science Park"},
      {name: "North Station"},
      {name: "Haymarket"},
      {name: "Park Street"},
      {name: "Boylston"},
      {name: "Arlington"},
      {name: "Copley"},
      {name: "Hynes Convention Center"},
      {name: "Kenmore"},
      {name: "Blandford Street"},
      {name: "Boston Univ. East"},
      {name: "Boston Univ. Central"},
      {name: "Boston Univ. West"},
      {name: "Saint Paul Street"},
      {name: "Pleasant Street"},
      {name: "Babcock Street"},
      {name: "Packards Corner"},
      {name: "Harvard Ave."},
      {name: "Griggs Street"},
      {name: "Allston Street"},
      {name: "Warren Street"},
      {name: "Washington Street"},
      {name: "Sutherland Road"},
      {name: "Chiswick Road"},
      {name: "Chestnut Hill Ave."},
      {name: "South Street"},
      {name: "Boston College"}
    ],
    "Green Line C - Westbound": [
      {name: "North Station"},
      {name: "Haymarket"},
      {name: "Park Street"},
      {name: "Boylston"},
      {name: "Arlington"},
      {name: "Copley"},
      {name: "Hynes Convention Center"},
      {name: "Kenmore"},
      {name: "Saint Mary Street"},
      {name: "Hawes Street"},
      {name: "Kent Street"},
      {name: "Saint Paul Street"},
      {name: "Coolidge Corner"},
      {name: "Summit Ave."},
      {name: "Brandon Hall"},
      {name: "Fairbanks Street"},
      {name: "Washington Square"},
      {name: "Tappan Street"},
      {name: "Dean Road"},
      {name: "Englewood Ave."},
      {name: "Cleveland Circle"}
    ],
    "Green Line C - Eastbound": [
      {name: "North Station"},
      {name: "Haymarket"},
      {name: "Park Street"},
      {name: "Boylston"},
      {name: "Arlington"},
      {name: "Copley"},
      {name: "Hynes Convention Center"},
      {name: "Kenmore"},
      {name: "Saint Mary Street"},
      {name: "Hawes Street"},
      {name: "Kent Street"},
      {name: "Saint Paul Street"},
      {name: "Coolidge Corner"},
      {name: "Summit Ave."},
      {name: "Brandon Hall"},
      {name: "Fairbanks Street"},
      {name: "Washington Square"},
      {name: "Tappan Street"},
      {name: "Dean Road"},
      {name: "Englewood Ave."},
      {name: "Cleveland Circle"}
    ],
    "Green Line D - Westbound": [
      {name: "North Station"},
      {name: "Haymarket"},
      {name: "Park Street"},
      {name: "Boylston"},
      {name: "Arlington"},
      {name: "Copley"},
      {name: "Hynes Convention Center"},
      {name: "Kenmore"},
      {name: "Fenway"},
      {name: "Longwood"},
      {name: "Brookline Village"},
      {name: "Brookline Hills"},
      {name: "Beaconsfield"},
      {name: "Reservoir"},
      {name: "Chestnut Hill"},
      {name: "Newton Centre"},
      {name: "Newton Highlands"},
      {name: "Eliot"},
      {name: "Waban"},
      {name: "Woodland"},
      {name: "Riverside"}
    ],
    "Green Line D - Eastbound": [
      {name: "North Station"},
      {name: "Haymarket"},
      {name: "Park Street"},
      {name: "Boylston"},
      {name: "Arlington"},
      {name: "Copley"},
      {name: "Hynes Convention Center"},
      {name: "Kenmore"},
      {name: "Fenway"},
      {name: "Longwood"},
      {name: "Brookline Village"},
      {name: "Brookline Hills"},
      {name: "Beaconsfield"},
      {name: "Reservoir"},
      {name: "Chestnut Hill"},
      {name: "Newton Centre"},
      {name: "Newton Highlands"},
      {name: "Eliot"},
      {name: "Waban"},
      {name: "Woodland"},
      {name: "Riverside"}
    ],
    "Green Line E - Westbound": [
      {name: "Park Street"},
      {name: "Boylston"},
      {name: "Arlington"},
      {name: "Copley"},
      {name: "Prudential"},
      {name: "Symphony"},
      {name: "Northeastern University"},
      {name: "Museum of Fine Arts"},
      {name: "Longwood Medical Area"},
      {name: "Brigham Circle"},
      {name: "Fenwood Road"},
      {name: "Mission Park"},
      {name: "Riverway"},
      {name: "Back of the Hill"},
      {name: "Heath Street"}
    ],
    "Green Line E - Eastbound": [
      {name: "Park Street"},
      {name: "Boylston"},
      {name: "Arlington"},
      {name: "Copley"},
      {name: "Prudential"},
      {name: "Symphony"},
      {name: "Northeastern University"},
      {name: "Museum of Fine Arts"},
      {name: "Longwood Medical Area"},
      {name: "Brigham Circle"},
      {name: "Fenwood Road"},
      {name: "Mission Park"},
      {name: "Riverway"},
      {name: "Back of the Hill"},
      {name: "Heath Street"}
    ]
  };

  // HELPERS
  var numReports = function(line) {
    return Reports.find({
      line: currentLine(),
      name: {$ne: 'Normal conditions'},
      expired: false
    }).count();
  };

  var currentLine = function() {
    return Router.current().params.line;
  };

  var currentStations = function () {
    return stations[currentLine()];
  }

  Template.main.helpers({
    noReports: function() {
      return numReports(currentLine()) === 0;
    },
    numReports: function() {
      return numReports(currentLine());
    },
    lineColor: function() {
      var line = currentLine();
      var lineColor = ""

      if(line.indexOf("Red") > -1) {
        lineColor = "red-line";
      }
      else if(line.indexOf("Green") > -1) {
        lineColor = "green-line";
      }
      else if(line.indexOf("Orange") > -1) {
        lineColor = "orange-line";
      }

      return lineColor;
    }
  });

  Template.createReport.helpers({
    stations: function () {
      return currentStations();
    },
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

  Template.main.helpers({
    stations: function () {
      return currentStations();
    },
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
      var line = currentLine();

      newReport = new Report(
        name,
        location,
        line,
        0, // Votes
        0, // Clears
        new Date(), // Created
        new Date(), // Updated
        false, // Expired
        initialWeight
      ).save();


      if (name === 'Normal conditions') {
        // Normal conditions expire all alerts
        alert_reports = Reports.find({
          line: line,
          location: location,
          name: {$ne: 'Normal conditions'},
          expired: false
        }).forEach(function(alert_report) {
          Reports.update(alert_report._id, {$set: {expired: true}});
        })
      } else {
        // Any alert expires normal conditions
        // We have to search first, cannot run mass update in untrusted code
        nc_report = Reports.findOne({
          line: line,
          location: location,
          name: 'Normal conditions',
          expired: false
        });
        if (nc_report)
          Reports.update(nc_report._id, {$set: {expired: true}});
      }
    }
  });

  Template.report.events({
    // Upvote the current event
    'click .upvote': function() {
      if (!Session.get(this._id)) {
        Session.setPersistent(this._id, 'upvoted');
        Reports.update(this._id, {$inc: {votes: 1}});
        Reports.update(this._id, {$inc: {weight: upvoteWeight}});
        Reports.update(this._id, {$set: {lastConfirmedAt: new Date()}});
      }
    },
    'click .downvote': function() {
      if (!Session.get(this._id)) {
        Reports.update(this._id, {$inc: {clears: 1}});
        Reports.update(this._id, {$set: {lastClearedAt: new Date()}});
        Reports.update(this._id, {$inc: {weight: downvoteWeight}});
        Session.setPersistent(this._id, 'downvoted');
      }
    }
  });
}

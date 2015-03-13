Reports = new Mongo.Collection('reports');

numReports = function(line) {
  return Reports.find({
    line: currentLine(),
    name: {$ne: 'Normal conditions'},
    expired: false
  }).count();
};

Report = function(name, location, line, votes, clears, createdAt, lastConfirmedAt, expired, weight) {
  this.name = name;
  this.location = location;
  this.line = line;
  this.votes = votes;
  this.clears = clears;
  this.createdAt = createdAt;
  this.lastConfirmedAt = lastConfirmedAt;
  this.expired = expired;
  this.weight = weight;
};

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
        // Cap weight to maxWeight
        var newWeight = docId.weight + upvoteWeight;
        if (newWeight > maxWeight)
          newWeight = maxWeight;
        return Reports.update(docId._id,
          {$set: {weight: newWeight, lastConfirmedAt: new Date()}});
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

Meteor.methods({
  saveReport: function (name, location, line) {
    // Create a new report
    var newReport =  Reports.insert({
      name: name,
      location: location,
      line: line,
      votes: 0,
      clears: 0,
      createdAt: new Date(),
      lastConfirmedAt: new Date(),
      expired: false,
      weight: initialWeight
    });

    if (name === 'Normal conditions') {
      // Normal conditions expire all alerts
      Reports.update(
        {
          line: line,
          location: location,
          name: {$ne: 'Normal conditions'},
          expired: false
        },
        {$set: {expired: true}},
        {multi: true}
      );
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
    return newReport;
  },
  upvoteReport: function(docId) {
    Reports.update(docId, {$inc: {votes: 1}});
    // Cap weight to maxWeight
    doc = Reports.findOne({_id: docId});
    var newWeight = doc.weight + upvoteWeight;
    if (newWeight > maxWeight)
      newWeight = maxWeight;
    Reports.update(docId,
      {$set: {weight: newWeight, lastConfirmedAt: new Date()}});
  },
  downvoteReport: function(docId) {
    Reports.update(docId, {$inc: {clears: 1}});
    Reports.update(docId, {$set: {lastClearedAt: new Date()}});
    Reports.update(docId, {$inc: {weight: downvoteWeight}});
  }
});

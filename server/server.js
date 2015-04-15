Meteor.startup(function() {
  Restivus.configure({
    useAuth: false,
    prettyJson:true
  });

  
  Restivus.addRoute('reports',{authRequired: false},{ 
      get: function(){
      //GET api/reports
      //Gives you the current list of active reports.
      var reports = Reports.find({expired: false}).fetch();
      return {statusCode:200, body:{data: reports}};
    }
  });
});

// Task to expire old reports. It checks every minute to see if there are
// tasks reported/confirmed more than 30 minutes ago.
SyncedCron.add({
  name: 'Expire old reports',
  schedule: function(parser) {
    return parser.text('every 1 minute');
  },
  job: function() {
    // Decay weight
    Reports.update(
      {expired: false},
      {$inc: {weight: intervalDecay}},
      {multi: true}
    );

    // Expire the ones with 0 or negative weights
    Reports.update(
      {weight: {$lte: 0}},
      {$set: {expired: true}},
      {multi: true}
    );

    var activeRemaining = Reports.find({expired: false}).count();
    console.log(activeRemaining + ' active reports remaining.');
  }
});

SyncedCron.start();

// Publish subset of non-expired reports to client
Meteor.publish('reports', function () {
  return Reports.find({expired: false});
});

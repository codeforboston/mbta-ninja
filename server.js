if (Meteor.isServer) {
  Meteor.startup(function() {});

  // Task to expire old reports. It checks every minute to see if there are
  // tasks reported/confirmed more than 30 minutes ago.
  var intervalDecay = -1; // How many points subtracted per interval

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

      var activeRemaining = Reports.find({expired: false}).count()
      console.log(activeRemaining + " active reports remaining.")
    }
  });

  SyncedCron.start();
}

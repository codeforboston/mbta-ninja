if (Meteor.isServer) {
  Meteor.startup(function() {});

  // Task to expire old reports. It checks every minute to see if there are
  // tasks reported/confirmed more than 30 minutes ago.
  SyncedCron.add({
    name: 'Expire old reports',
    schedule: function(parser) {
      return parser.text('every 1 minute');
    },
    job: function() {
      Reports.update(
        {lastConfirmedAt: {$lt: new Date(new Date() - 30 * 60000)}},
        {$set: {expired: true}},
        {multi: true}
      );
    }
  });

  SyncedCron.start();
}

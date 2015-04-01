Meteor.startup(function() {});

/*******************************************************************************
 Task that checks the realtime feed for MBTA alerts
 ******************************************************************************/
var ProtoBuf = Meteor.npmRequire('protobufjs');
var http = Meteor.npmRequire('http');
var feedUrl = 'http://developer.mbta.com/lib/GTRTFS/Alerts/Alerts.pb';

// Create a protobuf decoder
var transit = ProtoBuf.protoFromString(Assets.getText('gtfs-realtime.proto')).
  build('transit_realtime');

// Process the alerts feed
var parse = function(res) {
  var data = [];
  res.on('data', function(chunk) {
    data.push(chunk);
  });
  res.on('end', function() {
    data = Buffer.concat(data);
    var msg = transit.FeedMessage.decode(data);
    // Process the received alerts
    processAlerts(msg);
  });
};

var processAlerts = function(alerts) {
  // Do something with the alerts here. For now, just printing total count:
  console.log('Number of alerts received: ' + alerts.entity.length);
};

// Schedule the task
SyncedCron.add({
  name: 'Get latest MBTA alerts',
  schedule: function(parser) {
    return parser.text('every 1 minute');
  },
  job: function() {
    http.get(feedUrl, parse);
  }
});

/*******************************************************************************
 Task to expire old reports. It reduces the active reports' weight every minute
 and expires the ones that end up having 0 or negative weight.
 ******************************************************************************/
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

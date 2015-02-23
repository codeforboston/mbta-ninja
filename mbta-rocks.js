Events = new Mongo.Collection("events");

function Event(name, location, line, votes, clears, createdAt, lastConfirmedAt) {
	this.name = name;
	this.location = location;
  this.line = line;
	this.votes = votes;
	this.clears = clears;
  this.createdAt = createdAt;
	this.lastConfirmedAt = lastConfirmedAt;
}

Event.prototype = {
  save: function() {
		var docId = Events.findOne({
			name: this.name,
			location: this.location,
			line: this.line,
			expired: false
		});

		if (docId) { // Upvote
			if (Session.get(docId._id) == null) { // Can upvote
				// Avoid future upvotes
				Session.setPersistent(docId._id, "upvoted");
				return Events.update(docId._id, {$inc: {votes: 1}});
			}
		} else { // Create
			newEvent =  Events.insert({
	      name: this.name,
	      location: this.location,
        line: this.line,
	      votes: this.votes,
	      clears: this.clears,
	      createdAt: this.createdAt,
				lastConfirmedAt: this.lastConfirmedAt,
				expired: false
	    });
			// Avoid user to upvote her own alert
			Session.setPersistent(newEvent, "created")
			return newEvent;
		}
  }
};

Router.route("/", function () {
  this.render("landing");
});

Router.route('/lines/:line', function () {
  this.render("main");
},
{
  name: 'line.show'
});

if (Meteor.isClient) {

  var stations = [
    {name: "Alewife"},
    {name: "Davis"},
    {name: "Porter Square"},
    {name: "Harvard Square"},
    {name: "Central Square"},
    {name: "Kendall"},
    {name: "Charles/MGH"},
    {name: "Park Street"},
    {name: "Downtown Crossing"},
    {name: "South Station"},
    {name: "Broadway"},
    {name: "Andrew"},
    {name: "JFK/UMass"},
    {name: "North Quincy"},
    {name: "Wollaston"},
    {name: "Quincy Center"},
    {name: "Quincy Adams"},
    {name: "Braintree"},
    {name: "Savin Hill"},
    {name: "Fields Corner"},
    {name: "Shawmut"},
    {name: "Ashmont"},
  ];

  var eventTypes = [
    {name: "Delayed train"},
    {name: "Train too crowded to board"},
    {name: "Overcrowded platform"},
    {name: "Overcrowded train"},
    {name: "Train stopped between stations"},
    {name: "Disabled train"},
    {name: "Medical emergency"}
  ]

  var stationsWithBetween = function () {
    var result = []
    for(var i = 0; i < stations.length; i++) {
      result.push(stations[i]);
      if(i != stations.length - 1) {
        var between = {
          name: stations[i].name + " ~ " + stations[i+1].name
        };
        result.push(between);
      }
    }
    return result;
  }

  var lineBeingViewed = function () {
    return Router.current().params.line;
  }

  // Get a list of all the events
  Template.main.helpers({
    stations: stations,
		noEvents: function() {
			return Events.find({
				line: lineBeingViewed(),
				expired: false
			}).count() == 0;
		},
    numEvents: function() {
      return Events.find({
        line: lineBeingViewed(),
        expired: false
      }).count()
    },
    lineBeingViewed: function() {
      return lineBeingViewed();
    }
  });

  Template.main.rendered = function () {
    // Enable modal triggering with + button
    $('.modal-trigger').leanModal();
  };

  Template.station.helpers({
    events: function () {
      return Events.find({
        location: this.name,
        line: lineBeingViewed(),
        expired: false
      });
    }
  });

  Template.createEvent.helpers({
    stations: stations,
    stationsWithBetween: stationsWithBetween,
    eventTypes: eventTypes
  })

  Template.createEvent.events({
    'click .submit': function() {
      var nameInput = $("#nameInput");
      var name = nameInput.val();

      var locationInput = $("#locationInput");
      var location = locationInput.val();

      var votes = 0;
      var clears = 0;
      var line = lineBeingViewed();

      newEvent = new Event(
				name,
        location,
        line,
        votes,
        clears,
        new Date(),
        new Date()
			).save();
      console.log(Events.find({}).fetch());
    }
  });

  Template.event.events({
    // Upvote the current event
    "click .upvote": function () {
			if (!Session.get(this._id)) {
	      Events.update(this._id, {$inc: {votes: 1}});
				Events.update(this._id, {$set: {lastConfirmedAt: new Date()}});
				Session.setPersistent(this._id, "upvoted")
			} else { console.log("Cannot upvote again!") }
    },
    "click .downvote": function () {
			if (!Session.get(this._id)) {
	      Events.update(this._id, {$inc: {clears: 1}});
				Events.update(this._id, {$set: {lastClearedAt: new Date()}});
				Session.setPersistent(this._id, "downvoted")
			} else { console.log("Cannot downvote again!") }
    }
  });

	Template.event.helpers({
		canUpvote: function() {
  		return Session.get(this._id) == null
		},
		// Although this event type doesn't exist anymore, leaving this in for now in case
		// we decide to add it back.
    positive: function(eventName) {
      return (eventName == "Normal conditions");
    }
	});
}

if (Meteor.isServer) {
	Meteor.startup(function () {
	});

	SyncedCron.add({
		name: 'Expire old events',
		schedule: function(parser) {
			// parser is a later.parse object
			return parser.text('every 1 minute');
		},
		job: function() {
			// Expire events older than 30 minutes
			Events.update(
				{lastConfirmedAt: {$lt: new Date(new Date()-30*60000)}},
				{$set: {expired: true}},
				{multi: true}
			);
		}
	});

	SyncedCron.start();
}

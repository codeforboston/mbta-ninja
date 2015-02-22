Events = new Mongo.Collection("events");

function Event(name, location, votes, createdAt, lastConfirmedAt) {
	this.name = name;
	this.location = location;
	this.votes = votes;
  this.createdAt = createdAt;
	this.lastConfirmedAt = lastConfirmedAt;
}

Event.prototype = {
  save: function() {
		var docId = Events.findOne({
			name: this.name,
			location: this.location
		});

		if (docId) { // Upvote
			if (Session.get(docId._id) == null) { // Can upvote
				Session.setPersistent(docId._id, "upvoted");
				return Events.update(docId._id, {$inc: {votes: 1}});
			}
		} else { // Create
			return Events.insert({
	      name: this.name,
	      location: this.location,
	      votes: this.votes,
	      createdAt: this.createdAt,
				lastConfirmedAt: this.lastConfirmedAt
	    });
		}
  }
};

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

  // Get a list of all the events
  Template.body.helpers({
    stations: stations
  });

  Template.station.helpers({
    events: function () {
      return Events.find({ location: this.name });
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

      newEvent = new Event(
				name, location, votes, new Date(), new Date()
			).save();
			// Avoid user to upvote her own alert
			Session.setPersistent(newEvent, "created")
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
    }
  });

	Template.event.helpers({
		canUpvote: function() {
		return Session.get(this._id) == null
		}
	});

  $(document).ready(function(){
    $('.modal-trigger').leanModal();
  });
}

if (Meteor.isServer) {
	Meteor.startup(function () {
		// Expire events after 30 minutes. Expired document collection happens
		// every 60 seconds in MongoDB, so don't expect granularities under 1 min.
		Events._ensureIndex({ "lastConfirmedAt": 1 }, { expireAfterSeconds: 30*60 })
	});
}

Events = new Mongo.Collection("events");

function Event(name, location, votes){
	this.name = name;
	this.location = location;
	this.votes = votes;
  this.timestamp = new Date().getTime();
}

Event.prototype = {
  save: function() {
    Events.insert({
      name: this.name,
      location: this.location,
      votes: this.votes
    });
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
    events: function (stationName) {
      return Events.find({ location: stationName });
    }
  });

  Template.createEvent.helpers({
    stationsWithBetween: stationsWithBetween
  })

  Template.createEvent.events({
    'click .submit': function() {
      var nameInput = $("#nameInput");
      var name = nameInput.val();

      var locationInput = $("#locationInput");
      var location = locationInput.val();

      var votes = 0;

      new Event(name, location, votes).save();
      console.log(Events.find({}).fetch());
    }
  });

  Template.event.events({
    // Upvote the current event
    "click .upvote": function () {
      Events.update(this._id, {$inc: {votes: 1}});
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

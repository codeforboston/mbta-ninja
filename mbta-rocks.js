Events = new Mongo.Collection("events");

function Event(name, location, votes){
	this.name = name;
	this.location = location;
	this.votes = votes;
}

Event.prototype = {
  save: function() {
    Events.insert({name: this.name, location: this.location, votes: this.votes });
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
    console.log("here too");
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
    console.log(result);
    return result;
  }

  // Get a list of all the events
  Template.body.helpers({
    events: function () {
      console.log("here obvi");
      return Events.find({});
    },
    stations: stations
  });

  Template.createEvent.helpers({
    stationsWithBetween: stationsWithBetween
  })

  Template.createEvent.events({
    'click button': function() {
      var nameInput = $("#nameInput");
      var name = nameInput.val();

      var locationInput = $("#locationInput");
      var location = locationInput.val();

      var votes = 0;

      new Event(name, location, votes).save();
    }
  });

  Template.event.events({
    // Upvote the current event
    "click .upvote": function () {
      Events.update(this._id, {$inc: {votes: 1}});
    },
    // Downvote the current event
    "click .downvote": function () {
      Events.update(this._id, {$inc: {votes: -1}});
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

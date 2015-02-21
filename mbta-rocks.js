Events = new Mongo.Collection("events");

function Event(name, line, location, votes){
	this.name = name;
	this.line = line;
	this.location = location;
	this.votes = votes;
}

Event.prototype = {
  save: function() {
    Events.insert({name: this.name, line: this.line, location: this.location, votes: this.votes });
  }
};


if (Meteor.isClient) {
  // Get a list of all the events
  Template.body.helpers({
    events: function () {
      return Events.find({});
    }
  });

  Template.createEvent.events({
    'click button': function() {
      var nameInput = $("#nameInput");
      var name = nameInput.val();

      var lineInput = $("#lineInput");
      var line = lineInput.val();

      var locationInput = $("#locationInput");
      var location = locationInput.val();

      var votes = 0;

      new Event(name, line, location, votes).save();
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

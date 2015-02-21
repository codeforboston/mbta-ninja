Events = new Mongo.Collection("events");

if (Meteor.isClient) {
  // Get a list of all the events
  Template.body.helpers({
    events: function () {
      return Events.find({});
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

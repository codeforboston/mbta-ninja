Events = new Mongo.Collection("events");

if (Meteor.isClient) {
  Template.body.helpers({
    events: function () {
      return Events.find({});
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

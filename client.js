if (Meteor.isClient) {
  Template.main.rendered = function() {
    // Enable modal triggering with + button
    $('.modal-trigger').leanModal();

    setInterval(function(){
      var currentTime = moment().format("hh:mm:ss");
      $('#current-time').text(currentTime);
    }, 1000);
  };

  Template.report.rendered = function() {
    // Enable modal triggering with button on a "Normal conditions" event.
    $('.modal-trigger').leanModal();
  };

  Template.report.events({
    'click .modal-trigger': function(e) { 
      $('#locationInput').val(this.location);
    }
  });

  // SHARE BUTTONS
  Template.landing.rendered = function() {
    // Twitter button script
    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');

    // Facebook button script
    (function(d, s, id) {
        var js;
        var fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = '//connect.facebook.net/en_US/sdk.js#xfbml=1&appId=504450969581453&version=v2.0';
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
  };
}

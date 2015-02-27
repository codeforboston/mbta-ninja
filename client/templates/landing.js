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

  // Collapsible lines
  $('.collapsible').collapsible({
    accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
  });

  // Make whole div with line clickable
  $(".collapsible-body").click(function() {
    window.location = $(this).find("a").attr("href");
    return false;
  });
};

Template.landing.events({
  'click .line-item': function(e) {
    $(this).toggleClass('active');
  }
});

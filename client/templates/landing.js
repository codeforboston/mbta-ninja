Meteor.subscribe('reports');

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

  // Detect Android browsers and suggest install of app
  var ua = navigator.userAgent.toLowerCase();
  var isAndroid = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");
  if(isAndroid) {
    $(".intro-screen-content").prepend("<a href='https://play.google.com/store/apps/details?id=org.codeforboston.mbta_ninja'><img alt='Android app on Google Play'src='https://developer.android.com/images/brand/en_app_rgb_wo_45.png' /></a>");
  }
};

Template.landing.events({
  'click .line-item': function(e) {
    $(this).toggleClass('active');
  }
});

Template.landing.helpers({
  subwayLines: function() {
    return listOfLines().subway;
  },
  trainLines: function() {
    return listOfLines().train;
  }
});

Template.line.helpers({
  noReports: function(){
    return numReports(this.path) === 0;
  },
  numReports: function(){
    return numReports(this.path);
  },
  numLineReports: function() {
    
    var lineReports = 0;
    for(var i = 0; i< this.directions.length; i++){
      lineReports += numReports(this.directions[i].path);
    }
    return lineReports;
  },
  noLineReports: function()
  {
    var lineReports = 0;
    for(var i = 0; i< this.directions.length; i++){
      lineReports += numReports(this.directions[i].path);
    }
    return lineReports === 0;
  }
});

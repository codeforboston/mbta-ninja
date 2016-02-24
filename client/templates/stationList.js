
Template.stationList.rendered = function(){

  // Collapsible lines
$('.collapsible').collapsible({
  accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
});

// Make whole div with line clickable
$(".collapsible-body").click(function() {
  window.location = $(this).find("a").attr("href");
  return false;
});

}

Template.stationList.events({

  'click .line-item': function(e) {
    $(this).toggleClass('active');
  }

});

Template.stationList.helpers({

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

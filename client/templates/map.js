
//uses the geojson file from:  https://github.com/singingwolfboy/MBTA-GeoJSON

Template.map.rendered = function() {

  this.subscribe('reports', function() {
    //this function makes sure DOM updates have occurred
    Tracker.afterFlush(function() {
      fetchStopsAndUpdateMap();
    });
  });

  var colors = {
    red: "#C60813",
    orange: "#FA6820",
    green: "#0A6536",
    blue: "#041299",
    purple: "#801174",
    silver: "#949494"
  };

  function chooseColor(d) {
    var data = d.data ? d.data : d;
    var line = data.properties.lines[0];
    if (line == "mattapan") {
      line = "red"
    }
    return colors[line];
  }

  var layer = L.tileLayer(
    'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
      subdomains: 'abcd'
    });

  var northEast = L.latLng(42.5, -70.9),
      southWest = L.latLng(42.13, -71.3),
      bounds = L.latLngBounds(southWest, northEast);

  var map = new L.Map('leaflet-map-container', {
    center: new L.LatLng(42.3601, -71.0589),
    zoom: 11,
    maxZoom: 14,
    minZoom: 11,
    maxBounds: bounds
  });

  map.addLayer(layer);
  //need to re-render svg when map is zoomed
  map.on("viewreset", updateMap);

  var svg = d3.select(map.getPanes().overlayPane).append("svg").attr("id","map"),
      g = svg.append("g").attr("class", "leaflet-zoom-hide"),
      linkContainer = g.append("g").classed("line-link-container", true);

  function joinStopsAndReports(stopInfo, reports) {
    reports = reports || [];
    var reportNums = [];

    _.each(stopInfo.features, function(f) {
      var currentReports = _.filter(reports, function(r) {
        //the station name matches, and the line matches
        if (r.location.toLowerCase() == f.properties.name.toLowerCase() &&
          r.line.split(" ")[0].toLowerCase() == f.properties.lines[0]
        ) {
          return true
        }
      });
      if (currentReports.length) {
        f.properties.currentReports = currentReports;

      } else {
        f.properties.currentReports = [];
      }
    });
    return reportNums;
  }

  var stopInfo;

  function fetchStopsAndUpdateMap() {
    d3.json("stops.geojson", function(error, stops) {
      if (error) {
        console.warn("error loading data: " + error);
        return
      }

      // hiding silver line for now because of crappy metadata
      //&mattapan because not supported by mbta ninja
      // XXX fix silver line match up with ninja metadata, and "next stop"
      var featuresWithoutSilver = stops.features.filter(function(f) {
        return f.properties.lines.indexOf("silver") < 0 && f.properties.originalLines.indexOf("mattapan") < 0;
      });

      stops.features = featuresWithoutSilver;
      stopInfo = stops;
      updateMap();

      //re-render every 15 seconds
      var throttledUpdate = _.throttle(updateMap, 15000);

      //now that we have stop data, subscribe to reports changes using this meteor method
      Reports.find().observe({
        changed: function() {
          throttledUpdate();
        }
      });
    });
  }

  var force = d3.layout.force()
    .charge(0)
    .gravity(0);

    //needs to be accessible across updateMap functions
    var labelIntervalId;


  /* this function is called:
  1. the first time the map is rendered
  2. every time user zooms the leaflet map
  3. when meteor calls "change"
  */
  function updateMap() {

    var reports = Reports.find().map(function(r) {
      return r
    });

    linkContainer.selectAll("*").remove();

    joinStopsAndReports(stopInfo, reports);

    var reportWeights = [];

    _.each(stopInfo.features, function(s){
      s.totalWeight = 0;
      _.each(s.properties.currentReports, function(r){
      s.totalWeight+=r.weight;
    });
    reportWeights.push(s.totalWeight);
  });

    var scale = {
      11: [5, 20],
      12: [10, 30],
      13: [15, 35],
      14: [30, 40],
    }

    var symbolSize = d3.scale.linear()
      .domain([0, d3.max(reportWeights) || 0])
      .range([scale[map.getZoom()][0], scale[map.getZoom()][1]]);

    var bottomLeft = map.latLngToLayerPoint(southWest),
        topRight = map.latLngToLayerPoint(northEast);

    var width = topRight.x - bottomLeft.x,
        height = bottomLeft.y - topRight.y;

    svg.attr("width", width + 120)
      .attr("height", height + 120)
      .style("left", bottomLeft.x - 50 + "px")
      .style("top", topRight.y - 50 + "px");

    g.attr("transform", "translate(" + (-bottomLeft.x + 50) + "," + (-
      topRight.y + 50) + ")");

    force.size([width, height]);

    // labels for end stations
    var terminatingNames = {
      "alewife": "n",
      "ashmont": "s",
      "braintree": "s",
      "wonderland": "n",
      "forest-hills": "s",
      "oak-grove": "n",
      "boston-college": undefined,
      "cleveland-circle": undefined,
      "riverside": "w",
      "heath-st": undefined,
    };

    var terminators = g.selectAll(".terminator-label")
      .data(_.filter(stopInfo.features, function(f) {
        return _.keys(terminatingNames).indexOf(f.properties.id) > -1
      }), function(d) {
        return d.properties.id
      });

    terminators
      .enter()
      .append("text")
      .classed("terminator-label", true)
      .text(function(d) {
        return d.properties.id
      });

    terminators.each(function(d) {
      var d3this = d3.select(this);
      var coordinates = d.geometry.coordinates;
      coordinates = map.latLngToLayerPoint(new L.LatLng(coordinates[1],
        coordinates[0]));
      d3this.attr("transform", "translate(" + coordinates.x + "," +
        coordinates.y + ")");
      switch (terminatingNames[d.properties.id]) {
        case "n":
          d3this.attr("y", -20);
          break;
        case "s":
          d3this.attr("y", 20);
          break;
        case "e":
          d3this.attr("x", -20);
          break;
        case "w":
          d3this.attr("x", 20);
          break;
        case undefined:
          d3this.style("font-size", ".9em");
          if (d.properties.id == "boston-college") {
            d3this.attr("y", -10).attr("x", -10);
          } else if (d.properties.id == "cleveland-circle") {
            d3this.attr("x", -40).attr("y", 10);
          } else if (d.properties.id == "heath-st") {
            d3this.attr("y", 10);
          }
      }
    });

    //static station circles without Reports
    var nodesWithoutReports = stopInfo.features
      .filter(function(d) {
        return !d.properties.currentReports.length;
      });

    var stationsNoReports = g.selectAll("g.station.no-report")
      .data(nodesWithoutReports, function(d) {
        return d.properties.id + " " + d.properties.lines[0];
      });

    stationsNoReports.enter()
      .append("g")
      .classed("station", true)
      .classed("no-report", true)
      .append("circle")
      .attr("title", function(d) {
        return d.properties.name;
      })
      .attr("fill", function(d) {
        return chooseColor(d);
      })
      .attr("r", "2px");

    stationsNoReports
      .attr("transform", function(d) {
        var coordinates = d.geometry.coordinates;
        coordinates = map.latLngToLayerPoint(new L.LatLng(coordinates[1],
          coordinates[0]));
        //lazy caching
        d3.select(this).attr("x", coordinates.x).attr("y", coordinates.y);
        return "translate(" + coordinates.x + "," + coordinates.y + ")"
      });

    stationsNoReports.exit().remove();

    var nodesWithReports = stopInfo.features
      .filter(function(d) {
        return d.properties.currentReports.length;
      })
      .map(function(d) {
        var latLong = [d.geometry.coordinates[1], d.geometry.coordinates[0]],
            point = _.map(map.latLngToLayerPoint(latLong),
            function(v) {
              return v
            }),
          value = _.reduce(_.map(d.properties.currentReports, function(r) {
            return r.weight
          }), function(n, m) {
            return n + m
          });
        return {
          data: d,
          x: point[0],
          y: point[1],
          x0: point[0],
          y0: point[1],
          r: symbolSize(value),
        };
      });

    var nodeGroup = g.selectAll("g.has-report")
      .data(nodesWithReports, function(d) {
        return d.data.properties.id + " " + d.data.properties.lines[0]
      });

    var enteredNodes = nodeGroup
      .enter()
      .append("g")
      .classed("station", true)
      .classed("has-report", true)
      .on("click", function(d) {

        d3.event.stopPropagation();

        var directionReports = _.groupBy(d.data.properties.currentReports,"line"),
           container = d3.select(document.createElement("div"));

        container.append("h6").text(d.data.properties.name).classed(
          "tooltip-station-title", true);

        _.each(directionReports, function(v, k) {

          var dirContainer = container.append("div");

          dirContainer.append("a")
            .attr("href", "/lines/subway/" + k)
            .append("h6")
            .text(k);

          dirContainer.append("div")
            .html(function() {
              var reportStr = v.length == 1 ? "<b>1 report</b>" :
                "<b>" + v.length + " reports</b>";
              var i = '<i class="mdi-action-thumb-up"></i>';
              var totalConfirmations = _.map(v, function(report) {
                return report.votes - report.clears;
              });
              totalConfirmations = _.reduce(totalConfirmations,
                function(memo, num) {
                  return memo + num
                });
              //in case there are more clears than confirms
              totalConfirmations = totalConfirmations > 0 ? totalConfirmations : 0;
              return reportStr + "&nbsp;&nbsp;<b>" +
                totalConfirmations + "</b> " + i;
            });
        });

        L.popup()
          .setLatLng({
            lon: d.data.geometry.coordinates[0],
            lat: d.data.geometry.coordinates[1]
          })
          .setContent(container.html())
          .openOn(map);
      })
      .append("path")
      .classed("direction-arrow", true)
      .attr("stroke", chooseColor);

    nodeGroup.sort(function(a,b){
        return b.data.totalWeight - a.data.totalWeight;
      })
      .each(function(d) {
        var directionReports = _.groupBy(d.data.properties.currentReports,
          function(r) {
            return r.line.split("-")[1].trim().split("")[0].toLowerCase();
          });
        var directionLetters = _.keys(directionReports).sort().join("");
        var shapeDict = {
          "ns": "diamond",
          "n": "triangle-up",
          "s": "triangle-down",
          "ew": "diamond",
          "e": "triangle-up",
          "w": "triangle-down",
          "i": "triangle-down",
          "o": "triangle-up",
          "io": "diamond",
        };

        //for formatting
        this.__direction = directionLetters;

        if (!shapeDict[directionLetters]) {
          this.__direction = "ns";
        }

        d3.select(this)
          .select("path.direction-arrow")
          .attr("d", d3.svg.symbol()
            .size(Math.pow(d.r, 2))
            .type(shapeDict[directionLetters]))
          .attr("transform", function(d) {
            if (["ew", "e", "w", "i", "o", "io"].indexOf(directionLetters) >
              -1) {
              return "rotate(90)";
            }
          });
      });

    nodeGroup.selectAll("text").remove();
    //add labels
    nodeGroup.each(function(d) {
      var d3this = d3.select(this),
          words = d.data.properties.name.split(" "),
          space = 6, wordHeight = 6,
          totalHeight = wordHeight * words.length + (words.length - 1 * space),
          initialY = -totalHeight/2 + 4;
          //some weirdness with initial position of text a bit too low so just giving up on centering
      _.each(words, function(w,index){
        d3this.append("text")
        .classed("station-label", true)
        .attr("y", function(d){
          if (index === 0 ){
            return initialY;
          }
          else {
            return initialY + space * index  + wordHeight * index;
          }
        })
        .text(w);
      });
    });
    //clear label animation interval
    clearInterval(labelIntervalId);

    //show animation only if there are potentially too many labels
    if (map.getZoom() <= 12 && nodeGroup[0].length > 5){

      nodeGroup.selectAll("text").style("display", "none");
      //animate the labels
      var intervalIndex = 0;
      labelIntervalId = setInterval(function(){
        nodeGroup.selectAll("text").style("display", "none");
        var nodeToHighlight = nodeGroup.filter(function(d,i){
          return i === intervalIndex;
        });

        nodeToHighlight.selectAll("text").style("display", "block");
        //so it's on top
        nodeToHighlight.each(function(d){
          this.parentNode.appendChild(this);
        });

        intervalIndex = intervalIndex < nodeGroup[0].length ? intervalIndex + 1 : 0;
      }, 2000);
    }

    nodeGroup.exit().remove();

    //using d3.geom.quadtree to prevent close nodes
    //from stacking on top of eachother

    function tick(e) {
      nodeGroup.each(gravity(e.alpha * .1))
        .each(collide(.5));
    }

    function gravity(k) {
      return function(d) {
        d.x += (d.x0 - d.x) * k;
        d.y += (d.y0 - d.y) * k;
      };
    }

    function collide(k) {
      var q = d3.geom.quadtree(nodesWithReports);
      return function(node) {
        var nr = this.__data__.r,
          nx1 = node.x - nr,
          nx2 = node.x + nr,
          ny1 = node.y - nr,
          ny2 = node.y + nr;
        q.visit(function(quad, x1, y1, x2, y2) {
          //added the second condition -- not sure why necessary
          if (quad.point && (quad.point !== node) && node.x - quad.point
            .x) {
            var x = node.x - quad.point.x,
              y = node.y - quad.point.y,
              l = x * x + y * y,
              r = nr + quad.point.r;
            if (l < r * r) {
              l = ((l = Math.sqrt(l)) - r) / l * k;
              node.x -= x *= l;
              node.y -= y *= l;
              quad.point.x += x;
              quad.point.y += y;
            }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
      };
    }

    force
      .nodes(nodesWithReports)
      .on("tick", tick)
      .start();

    //to avoid possible slow animation, don't actually show the force layout
    var n = reports.length;
    for (var i = 1000; i > 0; --i) force.tick();
    force.stop();

    //lazy way to cache value for links below
    nodeGroup.attr("x", function(d) {
        return d.x
      })
      .attr("y", function(d) {
        return d.y
      })
      .attr("transform", function(d) {
        return "translate(" + d.x + ", " + d.y + ")";
      });

    //add lines connecting the stations
    var stations = g.selectAll(".station");
    stations.each(function(stationData) {
      var d3that = d3.select(this);
      stationData = stationData.data ? stationData.data : stationData;
      var line = stationData.properties.lines[0],
        nextStop = stationData.properties.nextStop;
      if (!nextStop.length) return;
      _.each(nextStop, function(n) {
        stations.each(function(d) {
          var d = d.data ? d.data : d;
          if (line !== d.properties.lines[0] || n !== d.properties.id) return;
            //found the next stop
            var d3this = d3.select(this),
                link = linkContainer.append("line")
                        .classed("line-link", true)
                        .attr("stroke", colors[line])
                        .attr("x1", function(d) {
                          return d3that.attr("x");
                        })
                        .attr("y1", function(d) {
                          return d3that.attr("y");
                        })
                        .attr("x2", function(d) {
                          return d3this.attr("x");
                        })
                        .attr("y2", function(d) {
                          return d3this.attr("y");
                        });
        });
      });
    });

  } // end updateMap

} // end template.map.rendered

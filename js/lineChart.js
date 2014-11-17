app.directive('lineChart', ['$Uni',
  function($Uni) {

    return function(scope, el, attr) {
      var margin = {
        top: 20,
        right: 15,
        bottom: 30,
        left: 35
      };

      var height = 250;
      var y = d3.scale.linear().range([height, 0]).domain([0, 65000]);
      var y2 = d3.scale.linear().range([height, 0]).domain([0, .37 / $Uni.timeScale]);
      var x = d3.scale.linear().domain([0, $Uni.numPatches]);
      var color = d3.scale.category10();
      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickValues([30, 80, 130, 180])
        .tickFormat(function(d) {
          return d - 130;
        });

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5)
        .tickFormat(function(d) {
          return d3.format('s')(d);
        });

      var line = d3.svg.line()
        .x(function(d) {
          return x(d.time);
        })
        .y(function(d) {
          return y(d.numServed * 13);
        })

      var line2 = d3.svg.line()
        .x(function(d) {
          return x(d.time);
        })
        .y(function(d) {
          return y(d.numArr * 13);
        })

      var line3 = d3.svg.line()
        .x(function(d) {
          return x(d.time);
        })
        .y(function(d) {
          return y2(d.vel);
        })
        .interpolate('basis');

      var line5 = d3.svg.line()
        .x(function(d) {
          return x(d.x);
        })
        .y(function(d) {
          return y(d.y);
        })

      var tip = d3.select(".tip");

      var svg = d3.select(el[0])
        .append("svg")
        .style('width', "100%")
        .style("height", height + margin.top + margin.bottom);

      var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var bg = svg.append("rect")
        .attr({
          height: height,
          opacity: 0
        })
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


      bg.on('mousemove', mousemove)
        .on('mouseout', mouseoutFunc);

      function mousemove() {

        var u = _.find(scope.patches, function(v) {
          var e = x.invert(d3.mouse(this)[0]);
          return v.time >= e;
        }, this);

        scope.$apply(function() {
          scope.param.info = u;
        });
        tip.style("opacity", .9)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 150) + "px");
      }

      function mouseoutFunc(d) {
        tip.style("opacity", 0);
      }

      var gXAxis = g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")");

      var xAxisText = gXAxis.append("text")
        .attr("y", -15)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("time");

      var gYAxis = g.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("cumulative veh");

      var myLine = g.append("path")
        .attr("class", "line")
        .attr("stroke-width", "2px")
        .attr("stroke", "black");

      var myLine2 = g.append("path")
        .attr("class", "line")
        .attr("stroke-width", "2px")
        .attr("stroke-dasharray", "2, 2")
        .attr("stroke", "black");

      var wishCurve = g.append("path")
        .attr("class", "line")
        .attr("stroke-width", "1px")
        .attr("stroke-dasharray", "4, 4")
        .attr("stroke", "#333")
        .style("shape-rendering", "crispEdges");

      var gLabel = g.append('g')
        .attr('class', 'g-label')
        .selectAll('text')
        .data([{
          dash: '4, 4',
          text: 'W(t)'
        }, {
          dash: '2, 2',
          text: 'A(t)'
        }, {
          dash: '1, 0',
          text: 'E(t)'
        }]);

      var a = gLabel.enter().append('g')
        .attr('transform', function(d, i) {
          return 'translate(' + [0, i * 30] + ')'
          ")";
        });

      a.append('text').text(function(d) {
        return d.text;
      })

      a.append('line')
        .attr('fill', 'none')
        .attr({
          x1: 30,
          x2: 50,
          y1: -4,
          y2: -4,
          'stroke-dasharray': function(d) {
            return d.dash;
          },
          stroke: 'black',
          'stroke-width': '2px'
        });




      // var myLine3 = g.append("path")
      //     .attr("class", "line")
      //     .attr("stroke-width", "2px")
      //     .attr("stroke", "purple");

      var drawn;

      scope.$on('drawEvent', update);

      $(window).on('resize', render);

      render();

      function render() {
        var width = d3.select(el[0]).node().offsetWidth - margin.left - margin.right;
        x.range([0, width]);
        gXAxis.call(xAxis);
        xAxisText.attr("transform", "translate(" + [width - 5, 0] + ")");

        bg.attr("width", width);
        wishCurve.datum([{
          x: 0,
          y: 0
        }, {
          x: 130,
          y: 0
        }, {
          x: 130,
          y: 65000
        }, {
          x: 200,
          y: 65000
        }]).attr("d", line5);
        d3.select('.g-label').attr('transform', 'translate(' + [width - 50, height / 2] + ')');
        if (drawn) update();

      }

      function update() {
        drawn = true;

        myLine.datum(scope.patches)
          .transition()
          .ease('linear')
          .attr("d", line);

        myLine2.datum(scope.patches)
          .transition()
          .ease('linear')
          .attr("d", line2);

        // myLine3.datum(scope.patches)
        //     .transition()
        //     .ease('linear')
        //     .attr("d", line3);

      }

    }; //end the big return

  }
]); //end directive definition

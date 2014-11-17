app.directive('mfdChart', function($Uni) {
  return function(scope, el, attr) {
    var margin = {
      top: 20,
      right: 45,
      bottom: 45,
      left: 50
    };
    var height = 250;

    var y = d3.scale.linear().range([height, 0]).domain([0, 35]);
    var x = d3.scale.linear().domain([0, 20000])
    var color = d3.scale.category10();
    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(d3.format('s'));

    var data = d3.range(0, 20000).map(function(d) {
      return {
        v: $Uni.findVel(d) * 60,
        n: d
      };
    });

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")

    var line = d3.svg.line()
      .x(function(d) {
        return x(d.n);
      })
      .y(function(d) {
        return y(d.v);
      })

    var svg = d3.select(el[0])
      .append("svg")
      .style('width', "100%")
      .style("height", height + margin.top + margin.bottom);

    var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var gXAxis = g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")

    var xText = gXAxis.append("text")
      // .attr("transform", "rotate(-90)")
      // .attr("y", 6)
      // .attr("dy", ".71em")
      .style("text-anchor", "middle")
      .text("accumulation, n");

    var gYAxis = g.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("dy", ".71em")
      .attr('x', -height/2)
      .style("text-anchor", "end")
      .text("km/hr");

    var myLine = g.append("path")
      .datum(data)
      .attr("d", line)
      .attr("class", "line")
      .attr("stroke-width", "2px")
      .attr("stroke", "black");

    $(window).on('resize', render);

    render();

    function render() {
      var width = d3.select(el[0]).node().offsetWidth - margin.left - margin.right;
      x.range([0, width]);
      gXAxis.call(xAxis);
      xText.attr('transform','translate(' + [width/2,35] +')')
      myLine.transition().attr("d", line);
    };

  }; //end the big return

}); //end directive definition

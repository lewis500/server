app.directive('lineChart', function() {

    var margin = {
        top: 20,
        right: 35,
        bottom: 30,
        left: 45
    };

    var height = 250;
    var y = d3.scale.linear().range([height, 0]).domain([0, 120]);
    var x = d3.scale.linear().domain([0, 200]);
    var color = d3.scale.category10();
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(10);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .x(function(d) {
            return x(d.time);
        })
        .y(function(d) {
            return y(d.cumServed);
        })
        .interpolate('basis');

    var line2 = d3.svg.line()
        .x(function(d) {
            return x(d.time);
        })
        .y(function(d) {
            return y(d.cumArr);
        })
        .interpolate('basis');

    return {
        restrict: 'A',
        link: function(scope, el, attr) {
            var svg = d3.select(el[0])
                .append("svg")
                .style('width', "100%")
                .style("height", height + margin.top + margin.bottom);

            var g = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var gXAxis = g.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")

            var gYAxis = g.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Cumulative miles arrived");

            var myLine = g.append("path")
                .attr("class", "line")
                .attr("stroke-width", "2px")
                .attr("stroke", "crimson");

            var myLine2 = g.append("path")
                .attr("class", "line")
                .attr("stroke-width", "2px")
                .attr("stroke", "steelblue");

            scope.$on('drawEvent', update);

            $(window).on('resize', render);

            render();

            function render() {
                var width = d3.select(el[0]).node().offsetWidth - margin.left - margin.right;
                x.range([0, width]);
                gXAxis.call(xAxis);
            };

            function update() {
                myLine.datum(scope.patches)
                    .transition()
                    .duration(200)
                    .ease('linear')
                    .attr("d", line);

                myLine2.datum(scope.patches)
                    .transition()
                    .duration(200)
                    .ease('linear')
                    .attr("d", line2);
            }

        } //end link function
    }; //end the big return

}); //end directive definition

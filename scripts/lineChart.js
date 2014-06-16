app.directive('lineChart', function() {

    var width = 300;

    var y = d3.scale.linear();
    var x = d3.scale.linear().domain([0, 200]).range([0, width])

    var margin = {
        top: 20,
        right: 35,
        bottom: 30,
        left: 45
    };

    var height = 250;

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
            return y(d.getCum());
        });

    return {
        restrict: 'A',
        link: function(scope, el, attr) {

            var svg = d3.select(el[0])
                .append("svg")
                .style('width', width + margin.left + margin.right)
                .style("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var myLine, drawn = false;

            scope.$on('drawEvent', updateData);

            y.range([height, 0]);

            y.domain([0, 125]);
            yAxis.scale(y);
            // render();

            function updateData() {
                var newVal = scope.patches;
                if (!drawn) drawFirstTime(newVal);
                else updateLine(newVal)
            }

            function updateLine(data) {
                myLine.datum(data)
                    .transition().duration(scope.tickPace)
                    .ease('linear')
                    .attr("d", line);
            }

            function drawFirstTime(data) {
                drawn = true;

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Cumulative miles arrived");

                myLine = svg.append("path")
                    .datum(data)
                    .attr("class", "line")
                    .attr("d", line)
                    .attr("stroke-width", "2px")
                    .attr("stroke", "crimson");

            } //end drawlines

        } //end link function
    }; //end the big return

}); //end directive definition

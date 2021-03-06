app.directive('lineChartFourth', function() {
    var width = 650;

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
            return x(d.T);
        })
        .y(function(d) {
            return y(d.vel);
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

            var data;

            var firing = false;

            // scope.$on("windowResize", render);

            scope.$on('drawEvent', updateData);

            y.range([height, 0]);

            y.domain([0, 1]);
            yAxis.scale(y);
            // render();

            function render() {
                svg.selectAll('*').remove();
                if (firing) drawLines();
            }

            function updateData() {
                data = scope.XT;
                firing = true;
                render();
            }

            function drawLines() {
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
                    .text("one over queue length");

                var c = svg.append("path")
                    .datum(data)
                    .attr("class", "line")
                    .attr("d", line)
                    .attr("stroke-width", "2px")
                    .attr("stroke", "crimson")

            } //end drawlines
        } //end link function
    }; //end the big return
}); //end directive definition

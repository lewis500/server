app.directive('lineChart', function() {

    var y = d3.scale.linear();
    var x = d3.scale.linear().domain([0, 310]);

    var margin = {
        top: 20,
        right: 35,
        bottom: 30,
        left: 45
    };

    var height = 250 - margin.top - margin.bottom;

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
                .style('width', 650)
                .style("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var data, width;

            var firing = false;

            scope.$on('tickEvent', updateData);

            x.range([0, 650]);

            y.range([height, 0]);

            y.domain([0, 125]);
            yAxis.scale(y);
            // render();

            function render() {
                svg.selectAll('*').remove();

                if (firing) drawLines();
            }



            function updateData() {
                data = scope.patches;

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
                    .text("Number Counted");

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

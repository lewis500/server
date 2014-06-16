app.directive('lineChartThird', function() {

    var margin = {
        top: 10,
        right: 55,
        bottom: 40,
        left: 65
    };

    var width = 300;
    var height = 200;
    var y = d3.scale.linear().range([height, 0]);
    var x = d3.scale.linear().range([0, width]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(10);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .x(function(d) {
            return x(d.index);
        })
        .y(function(d) {
            return y(d.val);
        });

    var myLine, avgLine, label;

    return {
        restrict: 'A',
        link: function(scope, el, attr) {

            var svg = d3.select(el[0])
                .append("svg")
                .style('width', width + margin.left + margin.right)
                .style("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var gXAxis = svg.append("g")
                .attr("class", "bartChart x axis")
                .attr("transform", "translate(0," + height + ")");

            var gYAxis = svg.append("g")
                .attr("class", "y axis");

            scope.$on('drawEvent', updateLine);

            function updateLine(newVal) {
                if (!scope.historyData) return;
                var data = scope.historyData;
                var a = d3.min([40, data.length]);
                data = data.slice(data.length - a);
                var b = d3.extent(data, function(d) {
                    return d.val
                });
                x.domain(d3.extent(data, function(d) {
                    return d.index;
                }));
                y.domain([b[0] * 0.9, b[1] * 1.1]);
                var average = d3.mean(data, function(d) {
                    return d.val;
                });
                scope.$apply(function() {
                    scope.average = average;
                })

                gXAxis.transition().duration(250).ease('cubic')
                    .call(xAxis);

                gYAxis.transition().duration(250).ease('cubic')
                    .call(yAxis);

                if (!myLine) {
                    myLine = svg.append("path")
                        .datum(data)
                        .attr("class", "line")
                        .attr("d", line)
                        .attr("stroke-width", "2px")
                        .attr("stroke", "crimson");
                }

                if (!avgLine) {
                    avgLine = svg.append("line")
                        .attr("class", "line average")
                        .attr("stroke-width", "2px")
                        .attr("stroke-dasharray", "3,3")
                        .attr("stroke", "#333");

                    // y.domain([d3.min([b[0], 0]), d3.max([b[1], 0])])
                    label = svg.append("text")
                        .attr("x", 3)
                        .attr("dy", ".35em")
                        .attr("class", "lineLabel")
                        .text('nothing')
                }

                avgLine
                    .attr({
                        x1: 0,
                        x2: width,
                        y1: y(average),
                        y2: y(average)
                    });

                label.text(function() {
                    return scope.form2(average)
                })
                    .attr("transform", function() {
                        return "translate(" + width + "," + y(average) + ")";
                    })

                myLine.datum(data)
                    .transition().duration(50)
                    .ease('linear')
                    .attr("d", line);
            }


        } //end link function
    }; //end the big return

}); //end directive definition

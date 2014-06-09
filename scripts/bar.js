app.directive('barChart', function() {

    var margin = {
        top: 20,
        right: 35,
        bottom: 30,
        left: 45
    };

    var wishTime = 100;

    var height = 250 - margin.top - margin.bottom;
    var width = 900;
    var numFormat = d3.format(".2r");

    var y = d3.scale.linear()
        .range([height, 0]);

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .2);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(0)
        .tickFormat(function(d) {
            return null;
        })

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");


    return {
        restrict: 'A',
        link: function(scope, el, attr) {

            var tip;

            setTimeout(function() {
                tip = d3.select(".tip");
            }, 1200);
            // scope.$on('tooltipLoadedEvent', function() {
            //     tip = d3.select(".tip");
            // });

            var svg = d3.select(el[0]).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


            function mouseoverFunc(d) {
                scope.tooltipper(d.info);
                tip.style("opacity", .9)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 150) + "px");
            }

            function mouseoutFunc(d) {
                tip.style("opacity", 0);
            }

            var gXAxis = svg.append("g")
                .attr("class", "bartChart x axis")
                .attr("transform", "translate(0," + height + ")");

            var gYAxis = svg.append("g")
                .attr("class", "y axis");

            scope.$on('drawEvent', updateData);

            var drawn = false;

            function draw(data) {
                if (x.domain().length == 0) {
                    x.domain(data.map(function(d) {
                        return d.w;
                    }));
                }

                var b = d3.extent(data, function(d) {
                    return d.val
                })

                y.domain([d3.min([b[0], 0]), d3.max([b[1], 0])])

                gXAxis
                    .call(xAxis);

                gYAxis
                    .call(yAxis);

                var bar = svg.selectAll(".bar")
                    .data(data)

                bar.enter().append("rect")
                    .attr("class", "bar")
                    .on('mouseover', mouseoverFunc)
                    .on('mouseout', mouseoutFunc);

                bar.transition()
                    .duration(300)
                    .ease('cubic')
                    .attr("x", function(d) {
                        return x(d.w);
                    })
                    .attr("width", x.rangeBand())
                    .attr("y", function(d) {
                        return y(d.val);
                    })
                    .attr("height", function(d) {
                        return height - y(d.val);
                    });
            }

            function updateData() {
                if (!scope.cars) return;
                var data = scope.cars
                    .map(function(d) {
                        return {
                            w: d.delta,
                            val: d.info[scope.whichStatistic],
                            info: d.info
                        }
                    });
                draw(data);
            }
        } //end link function
    }; //end the big return
}); //end directive definition

app.directive('barChart', ['$Uni',
    function($Uni) {

        return function(scope, el, attr) {

            var margin = {
                top: 10,
                right: 35,
                bottom: 10,
                left: 45
            };

            var width = 800 - margin.left - margin.right;
            var height = 160 - margin.top - margin.bottom;
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

            var tip = d3.select(".tip");

            var svg = d3.select(el[0]).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            function mouseoverFunc(d) {

                scope.$apply(function() {
                    scope.param.info = d;
                });
                tip.style("opacity", .9)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 150) + "px");
            }

            function mouseoutFunc(d) {
                tip.style("opacity", 0);
            }

            var gXAxis = svg.append("g")
                .attr("class", " x axis")
                .attr("transform", "translate(0," + height + ")");

            var gYAxis = svg.append("g")
                .attr("class", "y axis");

            scope.$on('drawEvent', draw);

            var everyfive = _.range(0, $Uni.cars.length).filter(function(d) {
                return d % 75 == 0;
            });

            function draw() {
                var data = everyfive.map(function(d) {
                    return $Uni.cars[d];
                });

                // debugger;

                var measure = scope.measure;
                if (!data) return;
                if (x.domain().length == 0) {
                    x.domain(data.map(function(d) {
                        return d.w;
                    }));
                    gXAxis.call(xAxis);
                }

                var b = d3.extent(data, function(d) {
                    return d[measure]
                });

                y.domain([d3.min([b[0], 0]), d3.max([b[1], 0])])

                gYAxis.transition().duration(200).ease('cubic')
                    .call(yAxis);

                var bar = svg.selectAll(".bar")
                    .data(data);

                bar.enter().append("rect")
                    .attr("class", "bar")
                    .on('mouseover', mouseoverFunc)
                    .on('mouseout', mouseoutFunc)
                    .on('click', function(d) {
                        scope.changeToll(d);
                    });

                bar.transition()
                    .duration(150)
                    .ease('cubic')
                    .delay(function(d, i) {
                        return 1 * i;
                    })
                    .attr("x", function(d) {
                        return x(d.w);
                    })
                    .attr("width", x.rangeBand())
                    .attr("y", function(d) {
                        return y(d[measure]);
                    })
                    .attr("height", function(d) {
                        return height - y(d[measure]);
                    });
            }

        }; //end the big return
    }
]); //end directive definition

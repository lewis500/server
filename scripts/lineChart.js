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
            var y = d3.scale.linear().range([height, 0]).domain([0, $Uni.cars.length]);
            var y2 = d3.scale.linear().range([height, 0]).domain([0, .37]);
            var x = d3.scale.linear().domain([0, $Uni.numPatches]);
            var color = d3.scale.category10();
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(10);

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickFormat(d3.format('s'))

            var line = d3.svg.line()
                .x(function(d) {
                    return x(d.time);
                })
                .y(function(d) {
                    return y(d.numServed);
                })
                .interpolate('basis');

            var line2 = d3.svg.line()
                .x(function(d) {
                    return x(d.time);
                })
                .y(function(d) {
                    return y(d.numArr);
                })
                .interpolate('basis');

            var line3 = d3.svg.line()
                .x(function(d) {
                    return x(d.time);
                })
                .y(function(d) {
                    return y2(d.vel);
                })
                .interpolate('basis');

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
                    opacity: 0.1
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
                .attr("transform", "translate(0," + height + ")")

            var gYAxis = g.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("numulative miles arrived");

            var myLine = g.append("path")
                .attr("class", "line")
                .attr("stroke-width", "2px")
                .attr("stroke", "crimson");

            var myLine2 = g.append("path")
                .attr("class", "line")
                .attr("stroke-width", "2px")
                .attr("stroke", "steelblue");

            var myLine3 = g.append("path")
                .attr("class", "line")
                .attr("stroke-width", "2px")
                .attr("stroke", "purple");

            var drawn;

            scope.$on('drawEvent', update);

            $(window).on('resize', render);

            render();

            function render() {
                var width = d3.select(el[0]).node().offsetWidth - margin.left - margin.right;
                x.range([0, width]);
                gXAxis.call(xAxis);
                bg.attr("width", width);
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

                myLine3.datum(scope.patches)
                    .transition()
                .ease('linear')
                    .attr("d", line3);

            }

        }; //end the big return

    }
]); //end directive definition

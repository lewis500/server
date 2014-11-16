app.directive('tollChart', ['$Uni',
    function($Uni) {

        return function(scope, el, attr) {
            var tip = d3.select(".tip");

            var margin = {
                top: 20,
                right: 35,
                bottom: 30,
                left: 35
            };

            var height = 250;
            var y = d3.scale.linear().range([height, 0]).domain([0, $Uni.phiVickrey]);
            var x = d3.scale.linear().domain([0, $Uni.patches.length]);
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
                    return y(d.toll);
                });


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

            var drawn;

            scope.$on('tollEvent', update);

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
                var data = _.range(1, $Uni.patches.length + 1).map(function(d) {
                    return {
                        time: d,
                        toll: scope.tolledGuy.evalToll(d)
                    };
                });
                myLine.datum(data)
                    .transition()
                    .ease('linear')
                    .attr("d", line);
            }

        }; //end the big return

    }
]); //end directive definition

app.directive('mfdChart', ['Universe',
    function(U) {
        return function(scope, el, attr) {
            var margin = {
                top: 20,
                right: 35,
                bottom: 30,
                left: 45
            };

            var height = 250;
            var y = d3.scale.linear().range([height, 0]).domain([0, d3.max(U.MFD, function(d) {
                return d.q;
            })]);            
            var x = d3.scale.linear().domain([0, 30])
            var color = d3.scale.category10();
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom").ticks(20)

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

            var line = d3.svg.line()
                .x(function(d) {
                    return x(d.k);
                })
                .y(function(d) {
                    return y(d.q);
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
                .datum(U.MFD)
                .attr("d", line)
                .attr("class", "line")
                .attr("stroke-width", "2px")
                .attr("stroke", "crimson");

            $(window).on('resize', render);

            render();

            function render() {
                var width = d3.select(el[0]).node().offsetWidth - margin.left - margin.right;
                x.range([0, width]);
                gXAxis.call(xAxis);
                myLine.transition().attr("d", line);
            };

        }; //end the big return

    } //end directive func
]); //end directive definition

app.directive('distanceChart', ['Universe',
    function(Universe) {
        return function(scope, el, attr) {
            var margin = {
                    top: 20,
                    right: 35,
                    bottom: 30,
                    left: 45
                },
                height = 250;

            var y = d3.scale.linear().range([height, 0]).domain([0, 50]);
            var x = d3.scale.linear().domain([0, 2]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

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
                .call(yAxis);

            var rawData = Universe.cars.map(function(d) {
                return d.delta;
            });

            var data = d3.layout.histogram()
                .bins(x.ticks(20))
                (rawData);

            var bar = g.selectAll(".bar")
                .data(data)
                .enter().append("g")
                .attr("class", "bar");

            var rect = bar.append("rect")
                .attr("x", 1);

            $(window).on('resize', render);

            render();

            function render() {
                var width = d3.select(el[0]).node().offsetWidth - margin.left - margin.right;
                x.range([0, width]);
                gXAxis.call(xAxis);

                bar.attr("transform", function(d) {
                    return "translate(" + x(d.x) + "," + y(d.y) + ")";
                });

                rect.attr("width", x(data[0].dx) - 1)
                    .attr("height", function(d) {
                        return height - y(d.y);
                    });

            }

        }; //end the big return

    } //end directive func
]); //end directive definition

(function(angular) {
  angular
    .module('mainApp')
    .directive('ganttChart', function($Uni, $rootScope) {

      var link = function(scope, el, attr) {
        var margin = {
          top: 20,
          right: 15,
          bottom: 30,
          left: 35
        };

        var color = d3.scale.category20();

        var colorScale = d3.scale.linear() //function that takes numbers & returns colors
          .domain([0, 200]) //domain of input data 1 to 38
          .range(["blue", "yellow"]) //the color range
          .interpolate(d3.interpolateHcl); //how to fill the inbetween colors

        var height = +attr.height;
        var y = d3.scale.ordinal().rangeBands([0, height], .1)
        var x = d3.scale.linear().domain([0, $Uni.numPatches]);
        var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

        var tip = d3.select(".tip");

        var svg = d3.select(el[0])
          .append("svg")
          .style('width', "100%")
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        var bg = svg.append('rect')
          .attr('height', height)
          .attr('fill', '#222');
          
        var rg = svg.append('g').attr('class', 'g-bar');

        var gXAxis = svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")");

        var drawn, bar;

        $rootScope.$on('drawEvent', update);

        $(window).on('resize', render);

        render();

        function render() {
          var width = d3.select(el[0]).node().offsetWidth - margin.left - margin.right;
          x.range([0, width]);
          gXAxis.call(xAxis);
          bg.attr('width', width);

          if (drawn) update();
          else create();
        }

        function create() {
          y.domain(_.pluck(scope.cars, 'index'));

          bar = rg.selectAll('.time')
            .data(scope.cars, function(d) {
              return d.index;
            })
            .enter()
            .append('rect')
            .attr('y', function(d) {
              return y(d.index);
            })
            .attr('class', 'time')
            .attr('fill', function(d, i) {
              return colorScale(i);
            })

        }

        function update() {
          if (!drawn) drawn = true;
          bar.data(scope.cars, function(d) {
              return d.index;
            })
            .transition()
            .ease('linear')
            .attr({
              x: function(d) {
                return x(d.aT);
              },
              width: function(d) {
                var w = x(d.dT) - x(d.aT);
                if (w < 0) w = 0;
                return w;
              },
              height: y.rangeBand()
            });

        }

      }; //end the big return

      return {
        scope: {
          cars: '=cars'
        },
        link: link
      };

    }); //end directive definition
})(window.angular);

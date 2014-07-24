app.controller('mainCtrl', ['$scope', 'Runner', '$Uni', 'Car',
    function($scope, Runner, $Uni, Car) {
        var TH = _.throttle(function() {
            $scope.$emit('drawEvent');
        }, 500);

        $scope.timer = new Runner(tickFun, 50);

        $scope.tolling = "none";

        $scope.$watch('tolling', function(v) {
            Car.prototype.setTolling(v);
        });

        $scope.tolledGuy = null;

        $scope.changeToll = function(d) {
            $scope.tolledGuy = d;
            $scope.$broadcast('tollEvent');
        }

        $scope.measure = "SP";
        $scope.info;

        $scope.updater = function(v) {
            $scope.info = v;
        }

        function tickFun() {
            $Uni.tick();
            $scope.cars = $Uni.cars;
            $scope.patches = $Uni.patches;
            TH();
        }

    } //end of cotnroller
]); //end of


setTimeout(function() {
    m = angular.element(document.body).injector();
    c = m.get('$Uni');
}, 2500);

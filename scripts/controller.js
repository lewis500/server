app.controller('mainCtrl', ['$scope', 'Runner', '$Uni', 'Car',
    function($scope, Runner, $Uni, Car) {
        var TH = _.throttle(function() {
            recalcit();
            $scope.$emit('drawEvent');
        }, 1000);

        $scope.timer = new Runner(tickFun, 50);

        $scope.tolling = "vickrey";

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

        function recalcit() {
            $scope.summary = _.reduce($Uni.cars, function(a, b) {
                return a + b[$scope.measure];
            }, 0) * $Uni.rescale / 1000;
            $scope.safeApply();
        }

        $scope.$watch('measure', recalcit);

        $scope.summary = 0;

        $scope.updater = function(v) {
            $scope.info = v;
        }

        function tickFun() {
            $Uni.tick();
            $scope.cars = $Uni.cars;
            $scope.patches = $Uni.patches;
            TH();
        }

        $scope.safeApply = function(fn) {

            var phase = this.$root.$$phase;

            if (phase == '$apply' || phase == '$digest') {

                if (fn && (typeof(fn) === 'function')) {

                    fn();

                }

            } else {

                this.$apply(fn);

            }

        };

    } //end of cotnroller
]); //end of


setTimeout(function() {
    m = angular.element(document.body).injector();
    c = m.get('$Uni');
}, 2500);

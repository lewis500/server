app.controller('mainCtrl', ['$scope', 'Runner', '$Uni', 'Car',
    function($scope, Runner, $Uni, Car) {
        $scope.tolledGuy = $Uni.cars[$Uni.cars.length - 1];
        console.log($scope.tolledGuy);
        var TH = _.throttle(function() {
            recalcit();
            $scope.$emit('drawEvent');
        }, 1000);

        $scope.timer = new Runner(tickFun, 5);
        $scope.tolling = "vickrey";
        $scope.measures = {
            SP: 0,
            user: 0,
            travel_cost: 0,
            toll: 0,
            social: 0
        };

        $scope.$watch('tolling', function(v) {
            Car.prototype.setTolling(v);
        });

        $scope.$watch('uni.maxQ', function() {
            if ($Uni.cars.length == 0) return;
            _.invoke($Uni.cars, 'setPhi');
            $Uni.phiVickrey = $Uni.cars[$Uni.cars.length - 1].phi;
            $scope.$emit('tollEvent');
        });

        $scope.changeToll = function(d) {
            $scope.tolledGuy = d;
            $scope.$emit('tollEvent');
        }

        $scope.measure = "SP";

        function recalcit() {
            var k = {};
            _.forEach($Uni.cars, function(car, i) {
                _.forEach($scope.measures, function(val, key) {
                    if (!k.hasOwnProperty(key) && car.hasOwnProperty(key)) k[key] = 0;
                    else k[key] += car[key] * $Uni.rescale / 65000;
                });
            });
            $scope.measures = k;
            $scope.first = _.findIndex($Uni.patches, function(d) {
                return d.servedNum > 0;
            });
            $scope.last = _.findLastIndex($Uni.patches, function(d) {
                return d.servedNum > 0;
            });
            $scope.safeApply();
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

app.controller('paramCtrl', ['$Uni', '$scope', '$starter',
    function($Uni, $scope, $starter) {
        $scope.uni = $Uni;
        $scope.starter = $starter;
        this.info;

    }
]);

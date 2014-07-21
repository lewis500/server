app.controller('mainCtrl', ['$scope', 'DataService', 'Runner', 'Universe', 'Car',
    function(s, DS, Runner, Universe, Car) {
        var TH = _.throttle(function() {
            s.$emit('drawEvent');
        }, 500);

        s.timer = new Runner(tickFun, 50);

        s.tolling = "none";

        s.$watch('tolling', function(v) {
            Car.prototype.setTolling(v);
        });

        s.tolledGuy = null;

        s.changeToll = function(d) {
            s.tolledGuy = d;
            s.$broadcast('tollEvent');
        }

        s.measure = "SP";
        s.info;

        s.updater = function(v) {
            s.info = v;
            // s.$apply();
        }

        function tickFun() {
            Universe.tick();
            s.cars = Universe.cars;
            s.patches = Universe.patches;
            TH();
        }

    } //end of cotnroller
]); //end of


setTimeout(function() {
    m = angular.element(document.body).injector();
    c = m.get('Universe');
}, 2500);

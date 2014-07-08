app.controller('mainCtrl', ['$scope', 'DataService', 'TimeKeepers', 'Universe',
    function(s, DS, TK, UU) {
        var TH = _.throttle(function() {
            s.$emit('drawEvent');
        }, 500)

        s.timer = new TK.Runner(tickFun, 50);

        _.extend(this, {
            tolling: UU.tolling
        });

        s.tolling = UU.tolling;

        s.$watch('tolling', function() {
            UU.setTolling(s.tolling);
            s.safeApply();
        });

        s.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

        function tickFun() {
            UU.tick();
            s.cars = UU.cars;
            s.patches = UU.patches;
            TH();
        }

        tickFun();

    } //end of cotnroller
]); //end of


setTimeout(function() {
    m = angular.element(document.body).injector();
}, 2500);

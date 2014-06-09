app.controller('mainCtrl', ['$scope', 'DataService',
    function(s, DS) {
        s.tickPace = 100;
        s.drawPace = 10;
        s.paused = true;

        var timer = runnerGen(function() {
            DS.tick();
            drawer.step();
            s.patches = DS.getPatches();
            s.XT = DS.getXT();
            s.$broadcast('tickEvent');
        }, s.tickPace);

        var drawer = stepperGen(function() {
            s.cars = DS.getCars();
            s.$broadcast('drawEvent')
        }, s.drawPace);

        s.whichStatistic = 'aT';

        s.form = d3.format('.3r');

        s.$watch('paused', timer.pause);

        s.summary = 0;

        s.setSummary = function(newVal) {
            s.summary = s.form(newVal);
            s.$apply();
        }

        s.tooltipper = function(d) {
            s.info = d;
            s.$apply();
        }

        s.tolling = true;

        s.$watch('tolling', DS.setTolling)

    } //end of cotnroller
]); //end of

function runnerGen(fun, pace) {
    var paused = true;

    function setPace(newpace) {
        pace = newpace;
    };

    function getPace() {
        return pace
    }

    function pause(newVal) {
        if (newVal !== undefined) paused = newVal;
        else {
            paused = !paused;
        }
        if (!paused) start();
    };

    function start() {
        var t = 0,
            timeSinceCall = 0,
            last = 0;

        d3.timer(function(elapsed) {
            t = (elapsed - last);

            //the tick part
            timeSinceCall = timeSinceCall + t;
            if (timeSinceCall >= pace) {
                timeSinceCall = 0;
                fun();
            }

            last = elapsed;

            return paused;
        });
    };

    return {
        start: start,
        pause: pause,
        setPace: setPace,
        getPace: getPace
    };

}


function stepperGen(fun, pace) {
    var steps = 0;

    function reset() {
        steps = 0;
    }

    function step() {
        steps++;
        if (steps < pace) return;
        steps = 0;
        fun();
    }

    function setPace(newPace) {
        pace = newPace;
    }

    return {
        setPace: setPace,
        step: step,
        reset: reset
    };

}

app.controller('mainCtrl', ['$scope', 'DataService',
    function(s, DS) {
        s.tickPace = 50;
        s.drawPace = 6;
        s.paused = true;
        s.tolling = "none";

        var timer = runnerGen(function() {
            DS.tick();
            drawer.step();
            s.patches = DS.getPatches();
            s.XT = DS.getXT();
            s.$broadcast('tickEvent');
        }, s.tickPace);

        var statsArray = [];

        var sumObject = {
            aT: 0,
            dT: 0,
            toll: 0,
            user: 0,
            travel: 0,
            SP: 0,
            w: 0,
            delta: 0,
            SD: 0,
            netCost: 0
        };

        var drawer = stepperGen(function() {
            var recent = _.clone(sumObject);
            var cars = DS.getCars();
            s.carData = cars
                .map(function(d) {
                    _.each(d.info, function(val, key) {
                        recent[key] += val;
                    });
                    return {
                        w: d.delta,
                        val: d.info[s.whichStatistic],
                        info: d.info
                    };
                });
            recent.index = statsArray.length;
            statsArray.push(recent);
            s.historyData = statsArray
                .map(function(d) {
                    return {
                        index: d.index,
                        val: d[s.whichStatistic]
                    };
                });
            s.summary = s.form(recent[s.whichStatistic]);
            s.$broadcast('drawEvent');
            s.$apply();
        }, s.drawPace);

        s.whichStatistic = 'netCost';

        s.form = d3.format('.3r');
        s.form2 = d3.format(",.0f")

        s.$watch('paused', timer.pause);
        s.$watch('tolling', function(newVal) {
            console.log(newVal);
            DS.setTolling(newVal);
        });

        s.tooltipper = function(d) {
            s.info = d;
            s.$apply();
        }


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

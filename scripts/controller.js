app.controller('mainCtrl', ['$scope', 'DataService',
    function(s, DS) {
        s.tickPace = 500;
        var preVal = s.tickPace;
        var timer = runnerGen(function() {
            DS.tick();
            s.patches = DS.getPatches();
            s.XT = DS.getXT();
            QQQ = s.patches;
            s.$broadcast('tickEvent');
        }, s.tickPace).pause(false);

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

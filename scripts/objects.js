function tick() {

    patches.forEach(function(d) {
        d.serve();
        d.evalX();
    });

    bigXT = patches
        .map(function(d) {
            var res = {
                X: d.getX(),
                T: d.time,
                patch: d
            };
            return res;
        })

    patches.forEach(function(d) {
        d.reset();
    });

    var sample = _.sample(cars, 20)

    sample.forEach(function(d) {
        d.choose(bigXT);
    });

    cars.forEach(function(d) {
        d.reset();
    });

}

function patcher(time) {
    var queue = [];
    var next = false;
    var prev = false;
    var X = 0;
    var vel = 0;

    function isEmpty() {
        return queue.length == 0;
    }

    function reset() {
        queue = [];
        X = 0;
        vel = 0;
    }

    function getX() {
        return X;
    }

    function setNext(n) {
        next = n;
    }

    function getNext() {
        return next;
    }

    function getPrev() {
        return prev;
    }

    function setPrev(n) {
        prev = n;
    }

    function serve() {
        if (queue.length === 0) {
            return;
        }
        var served = [];
        var passed = [];
        vel = 1 / queue.length;
        queue.forEach(function(d) {
            var diff = d.getDel() - vel;
            if (diff <= 0) {
                d.setDT(time);
                d.setDel(0);
                served.push(d);
            } else {
                d.setDel(diff);
                passed.push(d);
            }
        });

        if (next) next.receive(passed);
    }

    function receive(extras) {
        queue = queue.concat(extras);
    }

    function getQueue() {
        return queue;
    }

    function evalX() {
        if (!prev) X = 0;
        else X = (prev.getX() + vel);
    }

    return {
        serve: serve,
        receive: receive,
        reset: reset,
        getQueue: getQueue,
        time: time,
        getX: getX,
        setNext: setNext,
        setPrev: setPrev,
        evalX: evalX,
        getPrev: getPrev,
        getNext: getNext
    };
}

function Car(delta, index) {
    var C = this;
    C.index = index;
    var delta = delta;
    var delLeft = delta;
    var aT = wishTime;
    var dT = null;
    var patch = patches[aT];

    patch.getQueue().push(C);

    function getPatch() {
        return patch;
    }

    function setDT(newDT) {
        dT = newDT;
    }

    function reset() {
        delLeft = delta;
    }

    function getA() {
        return aT;
    }

    function getDel() {
        return delLeft;
    }

    function setDel(n) {
        delLeft = n;
    }

    function getCost() {
        return evalCost(aT, dT);
    }

    function evalCost(aT_p, dt_P) {
        var queueTime = dT - aT;
        var SD = (wishTime - dT);
        return {
            travel: queueTime * alpha,
            SD: d3.max([beta * SD, -gamma * SD]),
            getTotal: function() {
                return this.travel + this.SD;
            }
        };
    }

    function choose(XT) {
        var cost = evalCost(aT, dT).getTotal();
        var XTn = _.clone(XT);

        XTn.forEach(function(d) {
            var could = _.find(XTn, function(v) {
                v.T >= d.D + delta;
            });
            d.D = (could) ? could.T : 0;
        });

        XTn.forEach(function(d) {
            var pCost = evalCost(d.T, d.D).getTotal();
            if (pCost >= cost) return;
            cost = pCost;
            aT = d.T;
            patch = d.patch;
        });

        patch.getQueue().push(C);
    }


    C = _.extend(C, {
        choose: choose,
        getA: getA,
        setDT: setDT,
        getPatch: getPatch,
        getDel: getDel,
        setDel: setDel,
        delta: delta,
        reset: reset
    });

    return C;
}




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


function cumProb(d) {

    var p = sq(d) * m.acos(d / 2) + m.acos(1 - sq(d) / 2) - d / 2 * m.sqrt(4 - sq(d));

    return p / m.PI

}

function sq(d) {
    return m.pow(d, 2)
}

app.factory('DataService', function() {
    var patches, cars, pop, deltas, XT, tolling;

    var numPatches = 200,
        numCars = 100,
        wishTime = 100,
        alpha = 1,
        beta = 0.5,
        gamma = 1.5,
        numClass = 100,
        timeRange = d3.range(0, numPatches);

    reset();

    function reset() {
        patches = timeRange
            .map(function(d) {
                return patcher(d);
            });
        deltas = d3.range(1, numClass + 1).map(function(d) {
            return d / numClass * 2;
        });

        var lastW = 0;

        pop = deltas.map(function(d) {
            var cp = cumProb(d);
            var w = cp * numCars;
            var p = w - lastW;
            lastW = w;
            return {
                cumProb: cp,
                w: w,
                delta: d,
                count: Math.round(p)
            };
        });

        cars = [];
        pop.forEach(function(d) {
            d3.range(d.count).map(function(v) {
                var newCar = new Car(d.delta, d.w);
                cars.push(newCar);
            })
        });
    }


    function tick() {
        patches.forEach(function(d) {
            d.serve();
            d.evalX();
        });

        XT = patches
            .map(function(d) {
                var res = {
                    X: d.getX(),
                    T: d.time,
                    patch: d,
                    vel: d.getVel()
                };
                d.reset();
                return res;
            });

        // patches.forEach(function(d) {

        // });

        _.sample(cars, 1)
            .forEach(function(d) {
                d.choose(XT);
            });

        cars.forEach(function(d) {
            d.reset();
        });

        patches.forEach(function(d) {
            d.evalCum();
        });

    }

    function patcher(time) {
        var queue, X, vel, queueLoad, cumLoad;

        reset();

        function reset() {
            queue = [];
            vel = 1;
            queueLoad = 0;
            cumLoad = 0;
        }

        function serve() {
            if (queue.length == 0) return;
            var passed = [];
            vel = 1 / queue.length;
            queue.forEach(function(d) {
                if (d.getDel() <= vel) {
                    d.setDT(time);
                } else {
                    d.subtractDel(vel);
                    passed.push(d);
                }
            });
            getNext().receive(passed);
        }

        function getPrev() {
            return patches[time - 1] || false;
        }

        function getNext() {
            return patches[time + 1] || false;
        }

        function getCum() {
            return cumLoad;
        }

        function getVel() {
            return vel;
        }

        function evalX() {
            X = !getPrev() ? 1 : getPrev().getX() + vel;
        }

        function getX() {
            return X;
        }

        function receive(n) {
            queue = queue.concat(n);
        }

        function evalCum() {
            queueLoad = d3.sum(queue, function(d) {
                return d.getDel();
            });
            cumLoad = !getPrev() ? 0 : getPrev().getCum() + queueLoad;
        }

        return {
            serve: serve,
            reset: reset,
            time: time,
            evalX: evalX,
            getX: getX,
            evalCum: evalCum,
            getCum: getCum,
            receive: receive,
            getVel: getVel
        };
    }


    function Car(delta, w) {
        var C = this;
        var aT = wishTime;

        var delLeft, dT, patch;

        var cost = {
            total: 0,
            toll: 0,
            travel: 0,
            SP: 0
        };

        reset();

        function evalToll(t) {
            if (tolling === "none") return 0;
            var SD = wishTime - t;
            var P = d3.max([beta * SD, -gamma * SD]);
            var phi = (tolling == "vickrey") ? 100 : w;
            return d3.max([(phi * beta * gamma) / ((beta + gamma)) - P, 0]);
        }

        function reset() {
            delLeft = delta;
            patch = patches[aT];
            patch.receive([C]);
            C.info = {
                aT: aT,
                dT: dT,
                toll: (cost.toll),
                user: (cost.total),
                travel: (cost.travel),
                SP: (cost.SP),
                w: (w),
                delta: delta,
                SD: wishTime - dT,
                netCost: cost.travel + cost.SP
            };
        }

        function setDT(dTn) {
            dT = dTn;
            cost = evalCost(aT, dT);
        }

        function getDel() {
            return delLeft;
        }

        function subtractDel(n) {
            delLeft = delLeft - n;
        }

        function evalCost(aTn, dTn) {
            var travelTime = dTn - aTn;
            var SD = wishTime - dTn;
            var Q = {
                travel: travelTime * alpha,
                SP: d3.max([beta * SD, -gamma * SD]),
                toll: evalToll(dTn)
            }
            Q.total = Q.travel + Q.SP + Q.toll;
            return Q;
        }

        function choose(XT) {
            var XTn = _.clone(XT);
            var costn = _.clone(cost);

            XTn.forEach(function(d) {
                var could = _.find(XTn, function(v) {
                    return (v.X >= d.X + delta);
                });
                d.D = (could) ? could.T : d.T + delta;
            });

            XTn.forEach(function(d) {
                var pCost = evalCost(d.T, d.D);
                if (pCost.total < costn.total + .1) {
                    costn = pCost;
                    aT = d.T;
                    patch = patches[d.patch.time];
                }
            });
        }

        function getAt() {
            return aT;
        }

        function getCost() {
            return cost;
        }


        function getTotalCost() {
            return cost.total;
        }

        C = _.extend(C, {
            w: w,
            delta: delta,
            choose: choose,
            setDT: setDT,
            getDel: getDel,
            subtractDel: subtractDel,
            reset: reset
        });

        return C;
    }

    function getPatches() {
        return patches;
    }

    function getXT() {
        return XT;
    }

    function getCars() {
        return cars;
    }

    function setTolling(newVal) {
        console.log(newVal);
        tolling = newVal;
    }


    return {
        getPatches: getPatches,
        getXT: getXT,
        tick: tick,
        reset: reset,
        getCars: getCars,
        setTolling: setTolling
    };

});

function cumProb(d) {
    var m = Math
    var p = sq(d) * m.acos(d / 2) + m.acos(1 - sq(d) / 2) - d / 2 * m.sqrt(4 - sq(d));
    return p / m.PI
}

function sq(d) {
    return Math.pow(d, 2)
}

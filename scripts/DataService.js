app.factory('Universe', function() {

    return {
        tolling: "none",
        patches: [],
        cars: [],
        setTolling: function(v) {
            console.log(v)
            this.tolling = v;
        },
        tick: function() {
            _.invoke(this.patches, 'serve');
            _.invoke(this.patches, 'clearQueue');
            // var a = _.sample(this.cars, 25);
            // var b = _.max(this.cars, 'total');
            // b.choose();
            // var a = _.max(this.cars, 'total');
            // a.choose();
            _.invoke(_.sample(this.cars, 1), 'choose');
            _.invoke(this.cars, 'place');
            _.invoke(this.patches, 'evalCum');
        },
        reset: function() {
            this.tolling = "none";
            _.invoke(this.patches, 'reset');
            _.invoke(this.cars, 'reset');
            _.invoke(this.cars, 'place');
        }
    };
});

app.factory('Car', ['Universe',
    function(UU) {
        var wishTime = 100,
            alpha = 1,
            beta = 0.5,
            gamma = 1.5;

        _.extend(Car.prototype, {
            evalCost: function() {
                ec.call(this);
            },
            choose: function() {
                var cost = this.total,
                    aT = this.aT,
                    delta = this.delta;
                _.forEach(UU.patches, function(d, i, k) {
                    var D = _.find(k.slice(i), function(v) {
                        return v.X >= d.X + delta;
                    }) || k[k.length - 1];
                    var pCost = ec.call({
                        aT: d.time,
                        dT: D.time
                    });
                    if (pCost <= cost + .1) {
                        cost = pCost;
                        aT = d.time;
                    }
                });
                this.aT = aT;
                console.log(aT);
            },
            reset: function() {
                this.aT = _.random(0, 140);
                this.dT = 0;
                this.travel = 0;
                this.travel_cost = 0;
                this.SP = 0;
                this.SD = 0;
                this.toll = 0;
                this.total = 0;
                this.delLeft = this.delta;
            },
            place: function() {
                UU.patches[this.self.aT].queue.push(this.self);
            }
        });

        function ec() {
            this.travel = (this.dT - this.aT);
            this.travel_cost = alpha * this.travel;
            this.SD = wishTime - this.dT;
            this.SP = penalizer(this.SD);
            this.toll = evalToll(this.dT);
            this.total = this.travel_cost + this.SP + this.toll;
            return this.total;

            function penalizer(sd) {
                return d3.max([beta * sd, -gamma * sd]);
            }

            function evalToll(t) {
                if (UU.tolling === "none") return 0;
                var phi = (UU.tolling === "vickrey") ? 50 : this.w;
                return d3.max([(phi * beta * gamma) / ((beta + gamma)) - penalizer(wishTime - t), 0]);
            }
        }

        function Car(delta, w) {
            this.self = this;
            this.w = w;
            this.delta = delta;
            this.reset.call(this);
        }

        return Car;
    }
]);

app.factory('Patch', ['Universe',
    function(UU) {

        _.extend(Patch.prototype, {
            serve: serve,
            evalCum: evalCum,
            reset: reset,
            clearQueue: clearQueue
        });

        function serve() {
            var Q = this.queue,
                toPass = [];
            this.vel = findVel(Q.length);
            this.cumServed = this.prev ? (this.prev.cumServed) : 0;
            _.forEach(Q, function(car) {
                car.delLeft = car.delLeft - this.vel;
                if (car.delLeft <= 0 || !this.next) {
                    this.cumServed += car.delta;
                    car.dT = this.time;
                    car.delLeft = car.delta; //
                    car.evalCost();
                } else toPass.push(car);
            }, this);
            if (this.next) this.next.queue = toPass.concat(this.next.queue); //try other ordering instead?
            this.X = !this.prev ? 0 : this.prev.X + this.vel;
        }

        function clearQueue() {
            this.queue = [];
            this.vel = findVel(0);
        }

        function reset() {
            this.X = 0;
            this.cumServed = 0;
            this.vel = findVel(0);
            this.queue = [];
        }

        function evalCum() {
            var queueLoad = d3.sum(this.queue, function(d) {
                return d.delta;
            });
            this.cumArr = !this.prev ? 0 : this.prev.cumArr + queueLoad;
        }

        function findVel(qLength) {
            // if(qLength ==0) return 1;
            // return 1/qLength;
            var a = 1,
                b = 1 / 20;

            function inner(l) {
                return 1 - d3.max([0, d3.min([l - .05, .25])]) * (.4 / .25) - d3.max([0, d3.min([l - .3, .7])]) * (.6 / .7) + .02;
            }
            return a * inner(qLength * b);
        }

        function Patch(time) {
            this.self = this;
            this.time = time;
            this.next = null;
            this.reset.call(this);
        }

        return Patch;
    }
]);

app.factory('DataService', ['Universe', 'Car', 'Patch',
    function(UU, Car, Patch) {
        var numPatches = 200,
            numCars = 100,
            numClass = 100,
            diameter = 4.3,
            timeRange = d3.range(0, numPatches);

        _.forEach(timeRange, function(time, i) {
            var newPatch = new Patch(time);
            if (this.prev) {
                newPatch.prev = this.prev;
                this.prev.next = newPatch;
            }
            this.prev = newPatch;
            UU.patches.push(newPatch);
        }, {
            prev: null
        });

        var pop = d3.range(1, numClass + 1).map(function(v) {
            var d = v / numClass * 2;
            cp = cumProb(d),
            w = cp * numCars,
            p = this.lastW - w;
            this.lastW = w;
            return {
                cumProb: cp,
                w: w,
                delta: d,
                count: Math.round(p)
            };
        }, {
            lastW: 0
        });

        pop.forEach(function(d) {
            d3.range(d.count).map(function(v) {
                var newCar = new Car(d.delta, d.w);
                UU.cars.push(newCar);
            });
        });

        UU.reset();

        function cumProb(d) {
            return d3.min([sq(d), sq(1)]) / (2 * sq(1)) + 0.5 * d3.max([0, 1 - sq(1 - d) / sq(1)]);
        }

        function sq(d) {
            return Math.pow(d, 2)
        }

    }
]);

app.factory('TimeKeepers', function() {
    _.extend(Runner.prototype, {
        pause: function(P) {
            this.self.paused = (P !== undefined) ? P : !this.self.paused;
            if (!this.self.paused) this.start();
        },
        start: function() {
            var since = 0,
                last = 0,
                self = this;
            d3.timer(function(elapsed) {
                since = since + elapsed - last;
                if (since >= self.pace) {
                    since = 0;
                    self.fun();
                }
                last = elapsed;
                return self.paused;
            });
        }
    });

    function Runner(fun, pace) {
        this.paused = true;
        this.pace = pace;
        this.fun = fun;
        this.self = this;
    }

    //update the stepper!

    function Stepper(fun, pace) {
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

    return {
        Runner: Runner,
        Stepper: Stepper
    };

});

app.factory('$Uni', function() {
    var alpha = 1,
        beta = 0.75,
        gamma = 1.5,
        z = beta * gamma / (beta + gamma);

    return {
        patches: [],
        cars: [],
        wishTime: 120,
        alpha: alpha,
        hasFired: false,
        z: z,
        rescale: 14,
        numPatches: 200,
        maxQ: 78,
        penalizer: function(dT) {
            var sd = this.wishTime - dT;
            return d3.max([beta * sd, -gamma * sd]);
        },
        XT: [],
        XTMap: {},
        xPrecision: .25,
        makeXT: function() {
            this.XT = [];
            var bounds = d3.extent(this.patches, function(d) {
                return d.X;
            });
            var lastOne = this.patches[this.patches.length - 1];
            _.forEach(linspace(bounds[0], bounds[1], this.xPrecision), function(x) {
                var u = _.find(this.patches, function(v) {
                    return v.X >= x;
                }) || lastOne;

                this.XT.push({
                    x: x,
                    t: u.time,
                    patch: u
                });
            }, this);
        },
        tick: function() {
            _.invoke(this.patches, 'evalCum');
            _.invoke(this.patches, 'serve');
            // this.makeXT();
            var s = _.sample(this.cars, 10);
            _.invoke(s, 'choose');
            _.invoke(s, 'makeChoice');
            _.invoke(this.cars, 'place');
        }
    };
});

app.factory('Car', ['$Uni',
    function($Uni) {

        _.extend(Car.prototype, {
            evalCost: function() {
                ec.call(this.self, this.aT, this.dT);
            },
            setTolling: function(scheme) {
                switch (scheme) {
                    case "none":
                        this.evalToll = function(t) {
                            return 0;
                        };
                        break;
                    case "vickrey":
                        this.evalToll = function(t) {
                            return d3.max([0, $Uni.phiVickrey - $Uni.penalizer(t)]);
                        };
                        break;
                    case 'distance':
                        this.evalToll = function(t) {
                            return d3.max([0, this.phi - $Uni.penalizer(t)]);
                        };
                        break;
                }
            },
            choose: function() {
                var cost = this.user,
                    aT = this.aT,
                    delta = this.delta,
                    evaluator = _.bind(ec, {
                        evalToll: this.evalToll,
                        phi: this.phi
                    });
                var lastOne = $Uni.XT[$Uni.XT.length - 1];
                var numTicks = Math.round(delta / $Uni.xPrecision);

                _.forEach($Uni.patches, function(d, i, k) {
                    var D = _.find(k.slice(i), function(v) {
                        return v.X > d.X + delta;
                    }) || k[k.length - 1];
                    var pCost = evaluator(d.time, D.time);
                    if (pCost < cost) {
                        cost = pCost;
                        aT = d.time;
                    }
                });
                this.improvement = this.user - cost;
                this.poss = aT;
            },
            makeChoice: function() {
                this.aT = this.poss;
            },
            place: function() {
                $Uni.patches[this.aT].queue.push(this.self);
            }
        });

        function ec(aT, dT) {
            this.travel_cost = $Uni.alpha * (dT - aT);
            this.SP = $Uni.patches[dT].penalty;
            this.toll = this.evalToll(dT);
            this.social = this.SP + this.travel_cost;
            this.user = this.travel_cost + this.SP + this.toll;
            return this.user;
        }

        function Car(delta, w) {
            _.assign(this, {
                self: this,
                w: w,
                index: $Uni.cars.length,
                delta: delta,
                phi: $Uni.z * w / $Uni.maxQ,
                aT: _.random($Uni.numPatches * .1, $Uni.numPatches * .8),
                poss: null,
                improvement: null,
                dT: null,
                travel_cost: 0,
                SP: 0,
                toll: 0,
                delLeft: delta,
                user: 0,
            });
        }
        return Car;
    }
]);

app.factory('Patch', ['$Uni',
    function($Uni) {

        _.extend(Patch.prototype, {
            serve: function() {
                var Q = this.queue;
                this.queueLength = Q.length;
                this.vel = findVel($Uni.rescale * Q.length);
                this.served = 0;
                this.servedNum = 0;
                _.forEach(Q, function(car) {
                    car.delLeft += (-this.vel);
                    if (car.delLeft <= 0 || !this.next) {
                        // this.served += car.delLeft;
                        this.served += this.vel;
                        this.servedNum++;
                        car.dT = this.time;
                        car.delLeft = car.delta;
                        car.evalCost();
                    } else {
                        this.served += this.vel;
                        this.next.receive(car);
                    }
                }, this);
                this.cumServed = (this.prev ? this.prev.cumServed : 0) + this.served;
                this.numServed = (this.prev ? this.prev.numServed : 0) + this.servedNum;
                this.X = this.vel + (this.prev ? this.prev.X : 0);
                this.queue = [];
            },
            evalCum: function() {
                var queueLoad = d3.sum(this.queue, function(d) {
                    return d.delta;
                });
                this.cumArr = queueLoad + (!this.prev ? 0 : this.prev.cumArr);
                this.numArr = this.queue.length + (!this.prev ? 0 : this.prev.numArr);
            },
            receive: function(v) {
                this.queue.push(v);
            }
        });

        function Patch(time) {
            _.assign(this, {
                self: this,
                time: time,
                X: 0,
                next: null,
                cumServed: 0,
                numServed: 0,
                queueLength: 0,
                cumArr: 0,
                numArr: 0,
                servedNum: 0,
                served: 0,
                vel: findVel(0),
                queue: [],
                penalty: $Uni.penalizer(time)
            });
        }
        return Patch;
    }
]);

app.factory('$starter', ['$Uni', 'Car', 'Patch',
    function($Uni, Car, Patch) {
        return function() {
            _.forEach(d3.range(0, $Uni.numPatches), function(time, i) {
                var newPatch = new Patch(time);
                if (this.prev) {
                    newPatch.prev = this.prev;
                    this.prev.next = newPatch;
                }
                this.prev = newPatch;
                $Uni.patches.push(newPatch);
            }, {
                prev: null
            });

            _.forEach(linspace2(1, 3, 5000), function(d) {
                this.w += d;
                var newCar = new Car(d, this.w);
                newCar.place();
                $Uni.cars.push(newCar);
            }, {
                w: 0
            });

            $Uni.phiVickrey = $Uni.cars[$Uni.cars.length - 1].phi;

            $Uni.MFD = _.range(1, 16e3, 500).map(function(k, i) {
                return {
                    q: q(k) / 60 / $Uni.rescale,
                    k: k / $Uni.rescale,
                    v: findVel(k)
                };
            });

            $Uni.hasFired = true;
        };
    }
]);

app.factory('Runner', function() {

    _.extend(Runner.prototype, {
        pause: function(P) {
            this.paused = (P !== undefined) ? P : !this.paused;
            if (!this.paused) this.start();
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
    }

    return Runner;
});

function ma(a, b) {
    return d3.max([a, b]);
}

function mi(a, b) {
    return d3.min([a, b]);
}

function q(k) {
    var u = mi(k, 14000);
    u1 = ma(0, k - 14000);
    var g = 2.28e-8 * Math.pow(u, 3) - 8.62e-4 * Math.pow(u, 2) + 9.58 * u - u1 * 1.4;
    return (ma(g, 0) * 2.3);
}

function findVel(u) {
    u = ma(u, .01)
    return q(u) / u * 1.0 / 60;
}

function linspace(a, b, precision) {
    var c = 1.0 / precision;
    a = a * c;
    b = b * c;
    return d3.range(a, b).map(function(d) {
        return d * precision;
    });
}

function linspace2(a, b, n) {
    var Q = (b - a) / n;
    return _.range(0, n + 1).map(function(d) {
        return a + d * Q;
    });
}

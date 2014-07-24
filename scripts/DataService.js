app.factory('Universe', function() {
    return {
        patches: [],
        cars: [],
        XT: [],
        XTMap: {},
        tick: function() {
            _.invoke(this.patches, 'evalCum');
            _.invoke(this.patches, 'serve');
            var lastOne = this.patches[this.patches.length - 1];
            this.XTMap = (function(g) {
                var e = {};
                _.range(1, 500).forEach(function(d) {
                    var f = d / 10;
                    var u = _.find(g, function(v) {
                        return v.X >= f;
                    }) || lastOne;
                    e[f] = u.time;
                }, this);
                return e;
            })(this.patches);
            var s = _.sample(this.cars, 1)[0];
            s.choose();
            s.makeChoice();
            _.invoke(this.cars, 'place');
        }
    };
});

app.factory('Car', ['Universe',
    function(Universe) {
        var wishTime = 250,
            alpha = 1,
            beta = 0.5,
            gamma = 1.5,
            z = beta * gamma / (beta + gamma),
            maxQ = 0.80,
            totalW = 149,
            zVic = z * totalW / maxQ;

        _.extend(Car.prototype, {
            evalCost: function() {
                ec.call(this.self, this.aT, this.dT);
            },
            evalToll: null,
            setTolling: function(v) {
                switch (v) {
                    case "none":
                        this.evalToll = function(t) {
                            return 0;
                        };
                        break;
                    case "vickrey":
                        this.evalToll = function(t) {
                            return d3.max([0, zVic - penalizer(t)]);
                        };
                        break;
                    default:
                        this.evalToll = function(t) {
                            return d3.max([0, this.phi - penalizer(t)]);
                        };
                        break;
                }
            },
            choose: function() {
                var cost = this.total,
                    aT = this.aT,
                    delta = this.delta,
                    evaluator = _.bind(ec, {
                        evalToll: this.evalToll,
                        phi: this.phi
                    });

                _.forEach(Universe.patches, function(d, i, k) {
                    var D = _.find(k.slice(i), function(v) {
                        return v.X > d.X + delta;
                    }) || k[k.length - 1];
                    var pCost = evaluator(d.time, D.time);
                    if (pCost < cost) {
                        cost = pCost;
                        aT = d.time;
                    }
                });
                this.improvement = this.total - cost;
                this.poss = aT;
            },
            makeChoice: function() {
                this.aT = this.poss;
            },
            place: function() {
                Universe.patches[this.aT].queue.push(this.self);
            }
        });

        function ec(aT, dT) {
            this.travel = dT - aT;
            this.travel_cost = alpha * this.travel;
            this.SD = wishTime - dT;
            this.SP = penalizer(dT);
            this.toll = this.evalToll(dT);
            this.social = this.SP + this.travel_cost;
            this.total = this.travel_cost + this.SP + this.toll;
            return this.total;
        }

        function penalizer(dT) {
            var sd = wishTime - dT;
            return d3.max([beta * sd, -gamma * sd]);
        }

        function Car(delta, w) {
            _.assign(this, {
                self: this,
                w: w,
                delta: delta,
                phi: z * w / maxQ,
                aT: _.random(0, 400),
                poss: null,
                improvement: null,
                dT: null,
                travel: 0,
                travel_cost: 0,
                SP: 0,
                SD: 0,
                toll: 0,
                delLeft: delta,
                total: 0,
            });
        }

        return Car;
    }
]);

app.factory('Patch', ['Universe',
    function(Universe) {

        _.extend(Patch.prototype, {
            serve: function() {
                var Q = this.queue;
                this.vel = findVel(Q.length);
                this.served = 0;
                this.servedNum = 0;
                _.forEach(Q, function(car) {
                    car.delLeft = car.delLeft - this.vel;
                    if (car.delLeft <= 0 || !this.next) {
                        this.served += car.delLeft;
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
                vel: findVel(0),
                queue: []
            });
        }

        Universe.MFD = _.range(0, 30).map(function(k, i) {
            return {
                q: q(k),
                k: k,
                v: findVel(k)
            };
        });

        return Patch;
    }
]);

app.factory('DataService', ['Universe', 'Car', 'Patch',
    function(Universe, Car, Patch) {
        var numPatches = 500,
            numCars = 150,
            numClass = 2000,
            timeRange = d3.range(0, numPatches);

        _.forEach(timeRange, function(time, i) {
            var newPatch = new Patch(time);
            if (this.prev) {
                newPatch.prev = this.prev;
                this.prev.next = newPatch;
            }
            this.prev = newPatch;
            Universe.patches.push(newPatch);
        }, {
            prev: null
        });

        _.forEach(d3.range(120, numClass + 1), function(d) {
            var e = d / numClass;
            this.b += (prob(e) * 1 / numClass);
            if (this.b - this.a < this.threshold) return;
            this.a += this.threshold;
            this.w += (2 * e);
            Universe.cars.push(new Car(2 * e, this.w));
        }, {
            a: 0,
            b: 0,
            threshold: (1 / numCars),
            w: 0,
            g: 0
        });



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

function q(u) {
    var k = u / 2,
        a = 1;
    var g = a * mi(k, 2) + a / 2 * ma(mi(k, 5) - 2, 0) + 0 * ma(mi(8, k) - 5, 0) - a / 8 * ma(mi(12, k) - 8, 0) - a / 6 * ma(mi(k, 30) - 12, 0);
    return ma(g, 0) / 3.50;
}

function findVel(u) {
    var k = ma(.001, u);
    return q(k) / k;
}


function prob(d) {
    return 4 * (.5 - Math.abs(.5 - d));
}

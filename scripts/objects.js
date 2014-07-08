function tick() {
    _.invoke(patches, 'serve');
    _.invoke(_.sample(cars, 1), 'choose');
    _.invoke(patches, 'evalCum');
}

function Patch(time) {
    this.self = this;
    this.time = time;
    this.queue = [];
    if (time == 0) return;
    this.prev = patches[time - 1];
    this.prev.next = this;
}

(function() {
    _.extend(Patch.prototype, {
        serve: serve,
        evalCum: evalCum
    });

    function serve() {
        var Q = this.queue;
        if (Q.length > 0 && (this.next)) {
            this.vel = findVel(Q.length);
            var toPass = [];
            Q.forEach(function(car) {
                car.delLeft -= this.vel;
                if (car.delLeft <= 0) {
                    car.dT = this.time;
                    car.delLeft = 0;
                    car.evalCost();
                } else toPass.push(car);
            });
            this.next.queue = toPass.concat(this.next.queue); //try push instead?
        }
        this.X = this.prev ? 0 : this.prev.X + this.vel;
        Q = [];
        this.vel = findVel(0);
    }

    function reset() {
        this.X = 0;
        this.vel = 0;
        this.queue = [];
    }

    function evalCum() {
        var queueLoad = d3.sum(queue, function(d) {
            return d.del;
        });
        this.cumLoad = !this.prev ? 0 : this.prev.cumLoad + queueLoad;
    }

    function findVel(qLength) {
        return //code using qLength to find velocity
    }

})();

function Car(delta, w) {
    this.self = this;
    this.w = w;
    this.delta = delta;
}

(function() {
    _.extend(Car.prototype, {
        evalCost: function() {
            ec.call(this.self);
        },
        choose: function() {
            var cost = this.cost,
                aT = this.aT;
            patches.forEach(function(d, i, k) {
                var pCost = ec.call({
                    aT: d.T,
                    dT: _.find(k.slice(i), function(v) {
                        return v.X >= d.X + this.delta;
                    }).time || k[k.length - 1].time;
                });
                if (pCost >= cost) return;
                cost = pCost;
                aT = d.time;
            });
            this.aT = aT;
            patches[aT].queue.push(this.self);
            this.delfLeft = this.delta;
        },
        reset: function() {
            this.aT = wishTime;
            this.dT = 0;
            this.travel = 0;
            this.travel_cost = 0;
            this.SP = 0;
            this.SD = 0;
            this.toll = 0;
            this.total = 0;
            this.delLeft = delta;
            patches[this.aT].queue.push(this);
        }
    });

    function ec() {
        this.travel = (this.dT - this.aT);
        this.travel_cost = alpha * this.travel;
        this.SD = this.dT - wisthTime;
        this.SP = penalizer(this.SD);
        this.toll = evalToll(this.dT);
        this.total = this.travel_cost + this.SP + this.toll;
        return this.total;

        function penalizer(sd) {
            return d3.max([beta * sd, -gamma * sd]);
        }

        function evalToll(t) {
            if (tolling === "none") return 0;
            var phi = (tolling === "vickrey") ? cars[cars.length - 1].w : this.w;
            return d3.max([(phi * beta * gamma) / ((beta + gamma)) - penalizer(wishTime - t), 0]);
        }
    }
})();

function Runner(fun, pace) {
    this.paused = true;
    this.pace = pace;
    this.fun = fun;
}

_.extend(Runner.prototype, {
    pause: function(P) {
        this.paused = (P !== undefined) ? P : !this.paused;
        if (this.paused) this.start();
    },
    start: function() {
        var since = 0,
            last = 0;
        d3.timer(function(elapsed) {
            since += elapsed - last;
            if (since >= this.pace) {
                since = 0;
                this.fun();
            }
            last = elapsed;
            return this.paused;
        });
    }
});

app.factory('$Uni', function() {
  var alpha = 1,
    beta = alpha / 2,
    gamma = alpha * 2,
    z = beta * gamma / (beta + gamma),
    timeScale = 1,
    demandScale = 1;



  return {
    patches: [],
    cars: [],
    wishTime: 130 * timeScale * demandScale,
    alpha: alpha,
    sampleSize: 20,
    hasFired: false,
    beta: beta,
    gamma: gamma,
    z: z,
    timeScale: timeScale,
    rescale: 13 * demandScale,
    numPatches: 200 * timeScale * demandScale,
    maxQ: 97.6 / timeScale / demandScale,
    penalizer: function(dT) {
      var sd = this.wishTime - dT;
      return d3.max([beta * sd, -gamma * sd]);
    },
    XT: [],
    XTMap: {},
    findVel: function(u) {
      if (u <= 12000) return 30.8 * Math.exp(-u * 1.405e-4) / 60;
      var v1 = 30.8 * Math.exp(-12000 * 1.405e-4) / 60;
      return v1 - (u - 12000) * 7.1e-4 / 60;
    },
    tick: function() {
      _.invoke(this.patches, 'evalCum');
      _.invoke(this.patches, 'serve');
      var s = _.sample(this.cars, this.sampleSize);
      _.invoke(s, 'choose');
      _.invoke(s, 'makeChoice');
      _.invoke(this.cars, 'place');
    }
  };
});

app.factory('Car',
  function($Uni) {

    _.extend(Car.prototype, {
      evalCost: function() {
        ec.call(this.self, this.aT, this.dT);
      },
      setPhi: function() {
        this.phi = $Uni.z * this.w / $Uni.maxQ
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
            phi: this.phi,
            wish: this.wish,
            penalizer: this.penalizer
          });

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
        var thePatch = $Uni.patches[this.aT];
        thePatch.receive(this.self);
        thePatch.originals++;
      },
      penalizer: function(dT) {
        var sd = this.wish - dT;
        return d3.max([$Uni.beta * sd, -$Uni.gamma * sd]);
      }
    });

    function ec(aT, dT) {
      this.travel_cost = $Uni.alpha * (dT - aT);
      this.SP = this.penalizer(dT);
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
        phi: null,
        aT: Math.round(_.random($Uni.numPatches * .1, $Uni.numPatches * .9)),
        poss: null,
        improvement: null,
        dT: null,
        travel_cost: 0,
        SP: 0,
        toll: 0,
        delLeft: delta,
        user: 0,
        wish: $Uni.wishTime,
      });
      // var amt = $Uni.numPatches * 0.1;
      // this.wish = $Uni.wishTime + Math.round(_.random(-amt * $Uni.gamma, amt * $Uni.beta) / ($Uni.beta + $Uni.gamma));
      this.setPhi();
    }
    return Car;
  });

app.factory('Patch',
  function($Uni) {

    _.extend(Patch.prototype, {
      serve: function() {
        var Q = this.queue;
        this.queueLength = Q.length;
        this.vel = $Uni.findVel($Uni.rescale * Q.length);
        this.served = 0;
        this.servedNum = 0;
        _.forEach(Q, function(car) {
          car.delLeft += (-this.vel);
          if (car.delLeft <= 0 || !this.next) {
            this.served += car.delLeft;
            // this.served += this.vel;
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
        this.originals = 0;
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
        vel: $Uni.findVel(0),
        queue: [],
        originals: 0,
        penalty: $Uni.penalizer(time)
      });
    }
    return Patch;
  });

app.factory('$starter',
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
      //1.3,3.3
      _.forEach(linspace2(.8, 3.8, 5000), function(d) {
        this.w += d;
        var newCar = new Car(d, this.w);
        newCar.place();
        $Uni.cars.push(newCar);
      }, {
        w: 0
      });

      $Uni.ganttSample = linspace(0, 5000, 100)
        .map(function(d) {
          return $Uni.cars[d];
        });

      $Uni.phiVickrey = $Uni.cars[$Uni.cars.length - 1].phi;

      $Uni.hasFired = true;
    };
  });

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




function Car(delta, index) {
    this.self = this;
    this.index = index;
    this.delta = delta;
    this.delLeft = delLeft;
    this.aT = wishTime;
    this.dT = null;
    this.patch = patches[this.aT];
    this.patch.queue.push(this);
    this.cost = null;
}

_.extend(Car.prototype, {
    evalCost: function evalCost(aT, dT) {
        return 3;
    },
    choose: function choose() {
        this.cost = evalCost(this.aT, this.dT);
    }
});
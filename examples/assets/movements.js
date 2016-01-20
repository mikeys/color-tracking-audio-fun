// config = {
//   numberOfConsequentPoints: 30,
//   velocityThreshold: 0.1, // px/ms
//   timeThreshold: 2000, // ms
// };


MovementDetector = function(config, onMovementStopCallback) {
  this.Config = config;
  this.measurements = [];
  this.pointStorage = [];

  var that = this;

  this.movementStates = {
    MOVEMENT_UNKNOWN: 'start recording',
    MOVEMENT_STOPPED_WITH_ERROR: 'stopped with error',
    MOVEMENT_STOPPED_NORMALLY: 'stopped normally',
    MOVEMENT_CONTINUES: 'continues',
    MOVEMENT_IDLE: 'no movement'
  };

  this.state = that.movementStates.MOVEMENT_UNKNOWN;
  this.prevState = that.movementStates.MOVEMENT_UNKNOWN;

  this.onMovementStop = onMovementStopCallback;

  this.processState = function() {
    // console.log(that.state);
    // var prevState = that.state;
    // console.log("State: " + that.state);

    switch(that.state) {
      case that.movementStates.MOVEMENT_STOPPED_WITH_ERROR:
        that.measurements = [];
        that.pointStorage = [];

        // that.measurements = [];
        break;
      case that.movementStates.MOVEMENT_STOPPED_NORMALLY:
        // console.log()

        if (that.prevState != that.state) {

          // var measurements = that.measurements.slice();
          var points = that.pointStorage.slice();
        
          // console.log(measurements);
          // console.log(that.extractPointsFromMeasurements(measurements));

          that.onMovementStop(points, that.Config.color);

          if (that.measurements.length == that.Config.numberOfConsequentPoints) {
            that.measurements = [];
          }

          that.pointStorage = [];

          console.log('Stopped');  
        } else {

          // console.log('Idle');  
        }
        
        break;
    }

    // that.prevState = that.state

    return true;
  }

  this.processMeasurement = function(point, timestamp) {
    that.recordMeasurement(point, timestamp);
    that.recalculateMovementState();
    that.processState();
  }

  // this.extractPointsFromMeasurements = function() {
  //   var points = [];

  //   for (var i = 0; i < that.measurements.length; i++) {
  //     // console.log(that.measurements[i].point)
  //     points.push(that.measurements[i].point)
  //   }

  //   return points;
  // }

  this.recordMeasurement = function(point, timestamp) {
    // if has enough measurements take the left one off
    if (that.measurements.length > that.Config.numberOfConsequentPoints) {
      // console.log('Shifted');
      that.measurements.shift();
    }

    // console.log('Added');

    // add new to the right
    that.measurements.push({point: point, timestamp: timestamp});
    that.pointStorage.push(point);
  }

  this.recalculateMovementState = function() {
    that.prevState = that.state;

    var measurements = that.measurements;
    var velocityThreshold = that.Config.velocityThreshold;
    var timeThreshold = that.Config.timeThreshold;

    // check if last measurement was long time ago
    if (measurements.length > 2) {
      var t1 = measurements[measurements.length - 2].timestamp;
      var t2 = measurements[measurements.length - 1].timestamp;

      if (t2 - t1 > timeThreshold) {
        that.state = that.movementStates.MOVEMENT_STOPPED_WITH_ERROR;
        return;
        // return that.movementStates.MOVEMENT_STOPPED_WITH_ERROR;
      }
    }

    var sumVelocity = 0

    // console.log("***************");
    // console.log(measurements);
    // console.log(measurements.length);
    // console.log("***************");

    for(var i = 0, j = i + 1; i < measurements.length - 1; i++, j++) {
      var pointA = measurements[i].point;
      var timestampA = measurements[i].timestamp;

      var pointB = measurements[j].point;
      var timestampB = measurements[j].timestamp;

      var distance = Math.sqrt(Math.pow((pointB.X - pointA.X), 2) + Math.pow((pointB.Y - pointA.Y), 2));

      // console.log("=================");
      // console.log(pointA);
      // console.log(pointB);
      // console.log(distance);
      // console.log("=================");

      sumVelocity += distance / (timestampB - timestampA);
    }

    // console.log("Average velocity: " + sumVelocity / measurements.length);

    if (sumVelocity / measurements.length < velocityThreshold) {
      // console.log("Movement velocity is below threshold");
      that.state = that.movementStates.MOVEMENT_STOPPED_NORMALLY;
    } else {
      // console.log("Movement velocity is above threshold");
      that.state = that.movementStates.MOVEMENT_CONTINUES;
    }
  }
}

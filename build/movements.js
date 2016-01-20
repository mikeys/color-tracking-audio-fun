// config = {
//   numberOfConsequentPoints: 30,
//   velocityThreshold: 0.1, // px/ms
//   timeThreshold: 2000, // ms
// };


MovementDetector = function(config, onMovementStopCallback) {
  this.Config = config;
  this.measurements = [];

  var that = this;

  this.movementStates = {
    MOVEMENT_UNKNOWN: 'start recording',
    MOVEMENT_STOPPED_WITH_ERROR: 'stopped with error',
    MOVEMENT_STOPPED_NORMALLY: 'stopped normally',
    MOVEMENT_CONTINUES: 'continues'
  };

  this.state = that.movementState.MOVEMENT_UNKNOWN;

  this.onMovementStop = onMovementStopCallback;

  this.processState = function() {
    switch(that.state) {
      case that.movementStates.MOVEMENT_STOPPED_WITH_ERROR:
        that.measurements = [];
        break;
      case that.movementStates.MOVEMENT_STOPPED_NORMALLY:

        that.onMovementStop(measurements);

        that.measurements = [];
        break;
    }

    return true;
  }

  this.recordMeasurement = function(point, timestamp) {
    // if has enough measurements take the left one off
    if (that.measurements.length > that.Config.numberOfConsequentPoints) {
      that.measurements.shift();
    }

    // add new to the right
    that.measurements.push({point: point, timestamp: timestamp});
  }

  this.getMovementState = function() {
    var measurements = that.measurements;
    var velocityThreshold = that.Config.velocityThreshold;
    var timeThreshold = that.Config.timeThreshold;

    // check if last measurement was long time ago
    if (measurements.length > 2) {
      var t1 = measurements[measurements.length - 2].timestamp;
      var t2 = measurements[measurements.length - 1].timestamp;

      if (t2 - t1 > timeThreshold) {
        return MOVEMENT_STOPPED_WITH_ERROR;  
      }  
    }

    var sumVelocity = 0

    for(var i = 0, j = i + 1; i < measurements.length - 1; i++, j++) {
      var pointA = measurements[i].point;
      var timestampA = measurements[i].timestamp;

      var pointB = measurements[j].point;
      var timestampB = measurements[j].timestamp;

      var distance = Math.sqrt(Math.pow((pointB.x - pointA.x), 2) + Math.pow((pointB.y - pointA.y), 2));

      sumVelocity += distance / (timestampB - timestampA);
    }

    // console.log("Average velocity: " + sumVelocity / measurements.length);

    if (sumVelocity / measurements.length < velocityThreshold) {
      // console.log("Movement velocity is below threshold");
      return that.movementStates.MOVEMENT_STOPPED_NORMALLY;
    } else {
      // console.log("Movement velocity is above threshold");
      return that.movementStates.MOVEMENT_CONTINUES;      
    }
  }
}


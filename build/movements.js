MovementDetector = {};

MovementDetector.measurements = [];

MovementDetector.Config = {
  numberOfConsequentPoints: 30,
  velocityThreshold: 0.1, // px/ms
  timeThreshold: 2000 // ms
};

MovementDetector.movementState = {
  MOVEMENT_UNKNOWN: 'start recording',
  MOVEMENT_STOPPED_WITH_ERROR: 'stopped with error',
  MOVEMENT_STOPPED_NORMALLY: 'stopped normally',
  MOVEMENT_CONTINUES: 'continues'
};

MovementDetector.state = MovementDetector.movementState.MOVEMENT_UNKNOWN;

MovementDetector.processState = function() {
  switch(MovementDetector.state) {
    case MovementDetector.movementState.MOVEMENT_STOPPED_WITH_ERROR:
      MovementDetector.measurements = [];
      break;
    case MovementDetector.movementState.MOVEMENT_STOPPED_NORMALLY:
      // push to next processor

      MovementDetector.measurements = [];
      break;
  }

  return true;
}

MovementDetector.recordMeasurement = function(point, timestamp) {
  // if has enough measurements take the left one off
  if (MovementDetector.measurements.length > MovementDetector.Config.numberOfConsequentPoints) {
    MovementDetector.measurements.shift();
  }

  // add new to the right
  MovementDetector.measurements.push({point: point, timestamp: timestamp});
}

MovementDetector.getMovementState = function() {
  var measurements = MovementDetector.measurements;
  var velocityThreshold = MovementDetector.Config.velocityThreshold;
  var timeThreshold = MovementDetector.Config.timeThreshold;

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
    return MOVEMENT_STOPPED_NORMALLY;
  } else {
    // console.log("Movement velocity is above threshold");
    return MOVEMENT_CONTINUES;      
  }
}
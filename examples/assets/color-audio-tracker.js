Point.centerOf = function(rect) {
  return new Point(rect.x + (rect.width / 2), rect.y + (rect.height / 2));
};

Object.prototype.extendOwn = function(obj) {
   for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
         this[i] = obj[i];
      }
   }
};

ColorAudioTracker = function(options) {
  var that = this;

  var defaultOptions = {
    colorInstrument: {
      'magenta': 'drums'
    },
    recognizer: new DollarRecognizer(),
    movementDetectorConfig: {
      numberOfConsequentPoints: 30,
      velocityThreshold: 0.1, // px/ms
      timeThreshold: 2000 // ms
    }
  };

  console.log(defaultOptions);

  defaultOptions.extendOwn(options);
  options = defaultOptions;
  console.log(options);

  this.colorInstrument = options.colorInstrument;
  this.colors = function() { return Object.keys(that.colorInstrument); };
  this.tracker = new tracking.ColorTracker(that.colors());
  that.movementDetectorConfig = options.movementDetectorConfig;
  this.colorMovementDetector = createMovementDetectors();
  console.log(that.colorMovementDetector);
  this.recognizer = options.recognizer;
  this.videoElemId = options.videoElemId;
  this.velocityThreshold = options.velocityThreshold;

  // For debugging
  this.canvas = document.getElementById('canvas');
  this.context = that.canvas.getContext('2d');

  function createMovementDetectors() {
    var map = {};
    for (var color in that.colors()) {
      map[color] = new MovementDetector(that.movementDetectorConfig, onMovementStop);
      console.log(map[color]);
      console.log(that.movementDetectorConfig);
    }

    console.log(map);

    return map;
  };

  function onMovementStop(points) {
    console.log(that.recognizer.Recognize(points));
  }

  function track(event) {
    if (event.data.length === 0) {
      // No colors were detected in this frame.
    } else {
      console.log(event.data.length);
      var context = that.context;

      event.data.forEach(function(rect) {
        context.clearRect(0, 0, that.canvas.width, that.canvas.height);
        context.beginPath();

        context.rect(rect.x, rect.y, rect.width, rect.height);
        console.log(rect);
        // var points = [new Point(0,0), new Point(0, 50), new Point(50, 0), new Point(50, 50), new Point(0,0)]
        // console.log(that.recognizer.Recognize(points));

        var centerPoint = Point.centerOf(rect);
        console.log(that.colorMovementDetector);
        that.colorMovementDetector[rect.color].recordMeasurement(
          centerPoint, Date.now());

        context.fillRect(centerPoint.x, centerPoint.y, 1, 1);
        console.log(centerPoint);

        context.stroke();
        context.closePath();
      });
    }
  }

  // Register tracker
  this.tracker.on('track', track);

  this.init = function() {
    tracking.track(that.videoElemId, that.tracker, { camera: true });
  };
};

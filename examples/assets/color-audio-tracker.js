tracking.ColorTracker.registerColor('green', function(r, g, b) {
  // 35,137,87
  if (r < 50 && (g > 100 && g < 200) && b < 100) {
    return true;
  }
  return false;
});

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

Instrument = function(name, shapeSampleMap) {
  var that = this;

  this.Name = name;
  this.ShapeSampleMap = shapeSampleMap;
  // this.ShapeSampleMap = createSampleMap(shapeSampleMap);

  this.PlayByShape = function(shape) {
    if (that.ShapeSampleMap[shape]) {
      console.log(shape);
      new Audio('assets/audio/' + that.ShapeSampleMap[shape]).play();
      // that.ShapeSampleMap[shape].play();
    }
  }

  function createSampleMap(shapeSampleMap) {
    var map = {};
    for (var key in shapeSampleMap) {
      if (shapeSampleMap.hasOwnProperty(key)) {
        map[key] = new Audio('assets/audio/' + shapeSampleMap[key]);
      }
    }
    return map;
  }
}

ColorAudioTracker = function(options) {
  var that = this;

  var defaultOptions = {
    colorInstrument: {
      'magenta': 'drums'
    },
    recognizer: new DollarRecognizer(),
    movementDetectorConfig: {
      numberOfConsequentPoints: 10,
      velocityThreshold: 0.08, // px/ms
      timeThreshold: 2000 // ms
    }
  };

  defaultOptions.extendOwn(options);
  options = defaultOptions;
  console.log(options);

  this.colorInstrument = options.colorInstrument;
  this.colors = function() { return Object.keys(that.colorInstrument); };
  this.tracker = new tracking.ColorTracker(that.colors());
  that.movementDetectorConfig = options.movementDetectorConfig;
  this.colorMovementDetector = createMovementDetectors();
  this.recognizer = options.recognizer;
  this.videoElemId = options.videoElemId;
  this.velocityThreshold = options.velocityThreshold;
  this.instruments = createInstruments();

  // For debugging
  this.canvas = document.getElementById('canvas');
  this.context = that.canvas.getContext('2d');

  // register custom gestures
  for (var i = 0; i < custom_handlers.length; i++) {
    var handler_params = custom_handlers[i]();
    this.recognizer.AddGesture(handler_params[0], handler_params[1]);
  }
  function createMovementDetectors() {
    var map = {};
    var colors = that.colors();
    for (var i = 0; i < colors.length; i++) {
      var color = colors[i];

      var config = { color: color }
      config.extendOwn(that.movementDetectorConfig);
      console.log(config);
      map[color] = new MovementDetector(config, onMovementStop);
    }

    return map;
  };

  function onMovementStop(points, color) {
    var context = that.context;

    context.beginPath();
    for (var i = 0; i < points.length; i++) {
      // console.log(points[i].X);
      // console.log(points[i].Y);
      context.fillRect(points[i].X, points[i].Y, 10, 10);
    }

    context.stroke();
    context.closePath();

    // console.log(points);
    var result = that.recognizer.Recognize(points.reverse());
    if (result.Score > 0) {
        playAudio(color, result.Name)
    }
  }

  function playAudio(color, shape) {
    console.log(color);
    var instrument = that.colorInstrument[color];
    console.log(instrument);
    console.log(that.instruments);
    console.log(that.instruments[instrument]);
    that.instruments[instrument].PlayByShape(shape);
  }

  function createInstruments() {
    return {
      "ambiance": new Instrument("ambiance", { circle: "ambiance.wav" }),
      "effects1": new Instrument("effects1", { circle: "effects-thunder.mp3" }),
      "effects2": new Instrument("effects2", { circle: "effects-birds.mp3" }),
      "effects3": new Instrument("effects3", { circle: "allahu-akbar.mp3"})
    }
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
        // console.log(rect);

        var centerPoint = Point.centerOf(rect);
        // console.log(that.colorMovementDetector);

        that.colorMovementDetector[rect.color].processMeasurement(
          centerPoint, Date.now());

        context.fillRect(centerPoint.X, centerPoint.Y, 10, 10);
        // console.log(centerPoint);

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

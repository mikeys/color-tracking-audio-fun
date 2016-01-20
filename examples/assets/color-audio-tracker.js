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
  }

  defaultOptions.extendOwn(options);
  options = defaultOptions;

  this.colors = Object.keys(options.colorInstrument);
  this.tracker = new tracking.ColorTracker(that.colors);
  this.recognizer = options.recognizer;
  this.videoElemId = options.videoElemId;
  this.velocityThreshold = options.velocityThreshold;

  // For debugging
  this.canvas = document.getElementById('canvas');
  this.context = that.canvas.getContext('2d');

  this.track = function(event) {
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

        var points = [new Point(0,0), new Point(0, 50), new Point(50, 0), new Point(50, 50), new Point(0,0)]
        console.log(that.recognizer.Recognize(points));

        var centerPoint = Point.centerOf(rect);
        context.fillRect(centerPoint.x, centerPoint.y, 1, 1);
        console.log(centerPoint);

        context.stroke();
        context.closePath();
      });
    }
  };

  // Register tracker
  this.tracker.on('track', that.track);

  this.init = function() {
    tracking.track(that.videoElemId, that.tracker, { camera: true });
  };
};

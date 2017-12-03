/*
	first argument: css selector of elements what you want to detect on scrolling;
	threshold: A 'Number'. The percentage of the window height from which we want to start the detection (by bottom line);
  onSectionScroll: A callback function on element scrolling - arguments (object: {progress, direction, section});
  onSectionScrollStart: A callback function on element start - arguments (object: {progress, direction, section});
  onSectionScrollEnd: A callback function on element end - arguments (object: {progress, direction, section});
*/

(function(root, factory) {

  if(typeof exports === 'object' && typeof module === 'object')
    module.exports = factory();
  else if(typeof define === 'function' && define.amd)
    define([], factory);
  else if(typeof exports === 'object')
    exports["WayOnScreen"] = factory();
  else
    root["WayOnScreen"] = factory();

})(this, function() {
  //BEGIN Polyfill Array.from
  if (!Array.from) {
    Array.from = (function() {
      var toStr = Object.prototype.toString;
      var isCallable = function(fn) {
        return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
      };
      var toInteger = function (value) {
        var number = Number(value);
        if (isNaN(number)) { return 0; }
        if (number === 0 || !isFinite(number)) { return number; }
        return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
      };
      var maxSafeInteger = Math.pow(2, 53) - 1;
      var toLength = function (value) {
        var len = toInteger(value);
        return Math.min(Math.max(len, 0), maxSafeInteger);
      };

      return function from(arrayLike) {
        var C = this;
        var items = Object(arrayLike);
        if (arrayLike == null) {
          throw new TypeError('Array.from requires an array-like object - not null or undefined');
        }
        var mapFn = arguments[1];
        if (typeof mapFn !== 'undefined') {
          mapFn = arguments.length > 1 ? arguments[1] : void undefined;
          if (!isCallable(mapFn)) {
            throw new TypeError('Array.from: when provided, the second argument must be a function');
          }
          if (arguments.length > 2) {
            T = arguments[2];
          }
        }
        var len = toLength(items.length);
        var A = isCallable(C) ? Object(new C(len)) : new Array(len);
        var k = 0;
        var kValue;
        while (k < len) {
          kValue = items[k];
          if (mapFn) {
            A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
          } else {
            A[k] = kValue;
          }
          k += 1;
        }
        A.length = len;
        return A;
      };
    }());
  }
  //END Polyfill Array.from

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  //PLUGIN SCRIPT
  var WayOnScreen = function () {
    function WayOnScreen(selector, props) {
      _classCallCheck(this, WayOnScreen);

      this.sections = Array.from(document.querySelectorAll(selector));
      this.direction = null;
      this.threshold = props && props.threshold ? props.threshold : 0;
      this.onScrollCallbacks = [];
      this.onEnterCallbacks = [];
      this.onExitCallbacks = [];

      if (props && typeof props.onScroll === 'function') this.onScrollCallbacks.push(props.onScroll);
      if (props && typeof props.onEnter === 'function') this.onEnterCallbacks.push(props.onEnter);
      if (props && typeof props.onExit === 'function') this.onExitCallbacks.push(props.onExit);
    }

    _createClass(WayOnScreen, [{
      key: 'init',
      value: function init() {
        this.setSectionOptions();
        this.handleScroll();
      }
    }, {
      key: 'handleScroll',
      value: function handleScroll() {
        var _this = this;

        var previousScrollableOffset = window.pageYOffset;
        var DOWN = 'down';
        var UP = 'up';

        var detection = function detection() {
          var currentScrollableOffset = window.pageYOffset;

          if (previousScrollableOffset < currentScrollableOffset) {
            _this.direction = DOWN;
          } else {
            _this.direction = UP;
          }

          var direction = _this.direction;

          _this.sections.forEach(function (section) {

            var offset = _this.getOffset(section);
            var percent = offset.height / 100;
            var positionFromWindowBottom = window.innerHeight - window.innerHeight * (_this.threshold / 100);
            var onScreen = offset.height - (offset.bottom - positionFromWindowBottom);
            var progress = onScreen / percent;
            var props = { progress: progress, direction: direction, section: section };

            if ((progress > 100 || progress < 0) && !section.scrollEnded) {
              progress = progress > 50 ? 100 : 0;
              section.scrollEnded = true;
              section.scrollStarted = false;
              props.progress = progress;
              _this.callCallback('onScrollCallbacks', props);
              _this.callCallback('onExitCallbacks', props);
            } else if (progress >= 0 && progress < 100 && !section.scrollStarted) {
              progress = progress > 50 ? 100 : 0;
              section.scrollStarted = true;
              section.scrollEnded = false;
              props.progress = progress;
              _this.callCallback('onScrollCallbacks', props);
              _this.callCallback('onEnterCallbacks', props);
            }

            if (section.scrollEnded || !section.scrollStarted) return;
            _this.callCallback('onScrollCallbacks', props);
          });

          previousScrollableOffset = currentScrollableOffset;
        };

        detection();
        window.addEventListener('scroll', detection);
      }
    }, {
      key: 'callCallback',
      value: function callCallback(callbackName, props) {
        this[callbackName].length && this[callbackName].forEach(function (fn) {
          return fn(props);
        });
      }
    }, {
      key: 'getOffset',
      value: function getOffset(element) {
        return element.getBoundingClientRect();
      }
    }, {
      key: 'setSectionOptions',
      value: function setSectionOptions() {
        this.sections.forEach(function (section) {
          section.scrollEnded = true;
          section.scrollStarted = false;
        });
      }

      //CALLBACKS

    }, {
      key: 'onScroll',
      value: function onScroll(fn) {
        if (typeof fn != 'function') return this;
        this.onScrollCallbacks.push(fn);
        return this;
      }
    }, {
      key: 'onEnter',
      value: function onEnter(fn) {
        if (typeof fn != 'function') return this;
        this.onEnterCallbacks.push(fn);
        return this;
      }
    }, {
      key: 'onExit',
      value: function onExit(fn) {
        if (typeof fn != 'function') return this;
        this.onExitCallbacks.push(fn);
        return this;
      }
    }]);

    return WayOnScreen;
  }();
  return WayOnScreen;
});
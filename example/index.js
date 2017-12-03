'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
  first argument: css selector of elements what you want to detect on scrolling;
  threshold: A 'Number'. The percentage of the window height from which we want to start the detection (by bottom line);
  onSectionScroll: A callback function on element scrolling - arguments (object: {progress, direction, section});
  onSectionScrollStart: A callback function on element start - arguments (object: {progress, direction, section});
  onSectionScrollEnd: A callback function on element end - arguments (object: {progress, direction, section});
*/

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
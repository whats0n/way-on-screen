/*
	first argument: css selector of elements what you want to detect on scrolling;
	threshold: A 'Number'. The percentage of the window height from which we want to start the detection (by bottom line);
  onSectionScroll: A callback function on element scrolling - arguments (object: {progress, direction, section});
  onSectionScrollStart: A callback function on element start - arguments (object: {progress, direction, section});
  onSectionScrollEnd: A callback function on element end - arguments (object: {progress, direction, section});
*/

class WayOnScroll {

  constructor(selector, props) {
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
  
  init() {
    this.setSectionOptions();
    this.handleScroll();
  }
  
  handleScroll() {
  
    let previousScrollableOffset = window.pageYOffset;
    let DOWN = 'down';
    let UP = 'up';

    const detection = () => {
      const currentScrollableOffset = window.pageYOffset;
      
      if (previousScrollableOffset < currentScrollableOffset) {
        this.direction = DOWN;
      } else {
        this.direction = UP;
      }
      
      let direction = this.direction;
      
      this.sections
        .forEach(section => {
          
          const offset = this.getOffset(section);
          const percent = offset.height/100;
          const positionFromWindowBottom = (window.innerHeight - (window.innerHeight * (this.threshold/100)));
          const onScreen = offset.height - (offset.bottom - positionFromWindowBottom);
          let progress = onScreen/percent;
          const props = { progress, direction, section };
          
          if ((progress > 100 || progress < 0) && !section.scrollEnded) {
            progress = progress > 50 ? 100 : 0;
            section.scrollEnded = true;
            section.scrollStarted = false;
            props.progress = progress;
            this.callCallback('onScrollCallbacks', props);
            this.callCallback('onExitCallbacks', props);
          } else if ((progress >= 0 && progress < 100) && !section.scrollStarted) {
            progress = progress > 50 ? 100 : 0;
            section.scrollStarted = true;
            section.scrollEnded = false;
            props.progress = progress;
            this.callCallback('onScrollCallbacks', props);
            this.callCallback('onEnterCallbacks', props);
          }
          
          if (section.scrollEnded || !section.scrollStarted) return;
          this.callCallback('onScrollCallbacks', props);
            
        });
      
      previousScrollableOffset = currentScrollableOffset;
    };
    
    detection();
    window.addEventListener('scroll', detection);
  }
  
  callCallback(callbackName, props) {
    this[callbackName].length && this[callbackName].forEach(fn => fn(props));
  }
  
  getOffset(element) {
    return element.getBoundingClientRect();
  }
  
  setSectionOptions() {
    this.sections.forEach(section => {
      section.scrollEnded = true;
      section.scrollStarted = false;
    });
  }
  
  //CALLBACKS
  onScroll(fn) {
    if (typeof fn != 'function') return this;
    this.onScrollCallbacks.push(fn);
    return this;
  }  
  onEnter(fn) {
    if (typeof fn != 'function') return this;
    this.onEnterCallbacks.push(fn);
    return this;
  }  
  onExit(fn) {
    if (typeof fn != 'function') return this;
    this.onExitCallbacks.push(fn);
    return this;
  }  
}

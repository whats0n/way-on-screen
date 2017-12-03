Simple plugin for detection when the item on the screen (by bottom lane) and show in percentages how much of the item shows on the screen.

## Installation
```
$ npm install --save way-on-screen
```

## Usage
### Webpack
```js
var WayOnScreen = require('way-on-screen');
// run module here
```
### Old school files way ([example.html](https://whats0n.github.io/way-on-screen/example/index.html)):
```html
<script type="text/javascript" src="script.js"></script>
<script type="text/javascript" src="RUN_MODULE_HERE.js"></script>
```
## Running
```js
var DetectItemOnSceen = new WayOnScreen(css-selector, options);
DetectItemOnSceen.init();
// options reference in next section
```

#### Parameters (options)
```js
{
	//Set, in percent, the entry point from the bottom of the screen.
	threshold: 30 //a number
	
	//Callback funcitons
	//argument is an object with current item (section), percent (percent) and direction (direction).
	onEnter: function(props) 
	onExit: function(props)
	onScroll: function(props) 
}
```

## Methods
### init (callback)
Method for initialize detection.
```js
DetectItemOnScreen.init();
```
### onScroll (callback)
Calls every time on scroll when the top of the element offset more than or equal to the start point (at the bottom of the screen) and the lower bound of the element offset is less than or equal to the start point.
```js
DetectItemOnScreen.onScroll(function(props) {
	console.log(props);
});
```
### onEnter (callback)
Calls when the top of the element offset more than or equal to the start point (at the bottom of the screen)
```js
DetectItemOnScreen.onEnter(function(props) {
	console.log(props);
});
```
### onExit (callback)
Calls when the lower bound of the element offset is less than or equal to the start point (at the bottom of the screen)
```js
DetectItemOnScreen.onExit(function(props) {
	console.log(props);
});
```
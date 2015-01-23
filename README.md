RoboJS is a library that aims to dynamically load JS modules depending on how the DOM is composed.
Add a node to the DOM and a JS will be loaded!
Remove a node and the JS will be disposed!!
Not further framework frontend , but a tool that lets you manage the association DOM and JS.



#Installation
```javascript
bower install robojs
```


#How it works.
You set a `data-mediator` attribute with an ID (whatever you want)
```html
    <div data-mediator="mediator-a">a-2</div>
    <div data-mediator="mediator-b">b-1</div>
    <div data-mediator="mediator-c">c-1</div>
```
in `MediatorsMap.js` you define an Array that maps an ID and a Mediator path

```javascript
[
    {
        "id": "mediator-a",
        "mediator": "client/MediatorA"
    },
    {
        "id": "mediator-b",
        "mediator": "client/MediatorB"
    },
    {
        "id": "mediator-c",
        "mediator": "client/MediatorC"
    }
]
``` 
    	
For instance in this sample I mapped 3 different Mediators.

When the builder finds a match between a `data-mediator` attribute and an ID from `MediatorsMap`, 
it will create a new instance of Mediator, storing the DOM Node into a property named `element` and executes `initialize` method



###Example:

```javascript
// Application.js

var RoboJS=require("robojs");
var MediatorsMap = require("./MediatorsMap");
RoboJS.display.bootstrap({definitions:MediatorsMap});

```

This is the basic usage. ```bootstrap``` function creates a ```MediatorsBuilder``` instance and bootstraps it.

Most of the time you need invoking bootstrap in this way.

But if you need more control over ```MediatorsBuilder``` you can set ```autoplay``` to ```false```. This time bootstrap 
function just create ```MediatorsBuilder``` and  returns it. Then you can manually bootstrap it, attach handlers if needed. 


```javascript
// create an instance of MediatorsBuilder passing the map of Mediators.
// autoplay by default is true, but if you need more control, you can just pass true and manual bootstrap the builder
var builder = RoboJS.display.bootstrap({definitions:MediatorsMap,autoplay:false});

/*
 * get the mediators and return a promise.
 * The promise argument is an Array of Mediator instances
 *
 */
builder.bootstrap().then(function (mediators) {
    console.log("Mediators loaded", mediators);
}).catch(function (e) {
    console.log(e);
});

/*
 * when new DOM nodes are added to the document MutationObserver notify it, and a onAdded Signal is dispatched.
 * The Signal argument is an Array of Mediator instances
 *
 */
 
builder.onAdded.connect(function (mediators) {
    console.log("Mediators added async", mediators);
});

/*
 * when new DOM nodes are removed from the document MutationObserver notify it, and a onRemoved Signal is dispatched.
 * The Signal argument is an instances of Mediator.
 *
 */
 
builder.onRemoved.connect(function (mediator) {
    console.log("Mediators onRemoved async", mediator);
});
```

In this example `bootstrap` method scans `document.body` looking for `data-mediator` attribute

But let's say... you dynamically attached some elements to the DOM.
Well MutationObserver notify it and the `MediatorsBuilder` takes care to create the right Mediators.

```javascript
/**
 * on click a new random element is added to the DOM tree
 */
$(".add-button").on("click", function () {

    var element = $('<div data-mediator="mediator-b"></div>');
    /**
     * when an element is clicked, it will be removed.
     * Every Mediators will be removed too.
     */
    element.click(function (e) {
        element.remove();
    });

    $("body").append(element);
});
```

`sample folder` contains a working example with more use cases, nested and sibling nodes


#Mediator Class.
Mediator is the context where your logic runs for a specific bunch of DOM.
When a `data-mediator` matches an ID from MediatorsMap a new instance of Mediator is created. the DOM element is stored into a property named `element` and the `initialize` method is invoked.


Mediators should observe one of the following forms:

* Extend the base `RoboJS.display.Mediator` class and override `initialize()` and, if needed, `destroy()`.
* Don't extend the base `RoboJS.display.Mediator` class, and provide functions `initialize()` and, if needed, also `destroy()`.

`initialize()` function initializes the mediator. This is run automatically by the `MediatorBuilder` when a mediator is created. 
Normally the `initialize` function is where you would add handlers or dispatch events using the `eventMap`.


###Mediator that exends RoboJS.display.Mediator

You can sub-class `RoboJS.display.Mediator` class in order to code your logic. For example i defined `MediatorB`.

`RoboJS.display.Mediator` has a reference to `eventDispatcher`. 
This way it can dispatch / listen to messages in your application.
`addContextListener` and `removeContextListener` are responsible to map and unmap events registered to `eventDispatcher`. `dispatch` is responsible to send events with `eventDispatcher`.

Usually handlers are registered in `initialize` function

```javascript
// 'event-name' is a String.
// this._handleEvent is the listener function.
// this is the scope of listener.
this.addContextListener("event-name", this._handleEvent, this);
```

To remove the listener you can do 

```javascript
// 'event-name' is a String.
// this._handleEvent is the listener function.
this.removeContextListener("event-name", this._handleEvent);
```

When DOM element is removed from DOM Tree, `RoboJS.display.Mediator` removes all listeners registered to `eventMap` and the `destroy` method is executed.  

No matter how you implement inheritance. I just played with Vanilla-js to keep as cleaner as possible 


```javascript
// MediatorB.js

var RoboJS=require("RoboJS");

function MediatorB() {
    RoboJS.display.Mediator.apply(this, arguments);
}

MediatorB.prototype = Object.create(RoboJS.display.Mediator.prototype, {
    constructor: {
        value: MediatorB
    },
    initialize: {
        value: function () {

            /**
             * a new listener is added.
             *
             */
            this.addContextListener("event-name", this._handleEvent, this);
        }
    },
    _handleEvent: {
        value: function (e) {

            // after the first fired event, the listener is removed.
            this.removeContextListener("event-name", this._handleEvent);
        }
    },
    destroy: {
        value: function () {
            console.log("destroy");
        }
    }
});
```

###Mediator that DOESN'T exends RoboJS.display.Mediator

If you just need to load JS based on DOM and you don't need `RoboJS.display.Mediator` features, you can create your own class and provide functions `initialize()` and, if needed, also `destroy()`.
By default `element` parameter, that represents DOM node, is always passed into constructor by `MediatorsBuilder`
In `sample/real-world-project/js/modules/toggle` folder there is `ToggleModule` implemented in this way.

```javascript
function ToggleModule(element) {
    this.element = $(element);
}

ToggleModule.prototype = {
    initialize: function () {
        var JQUERY_MODULE = "<div class='results-panel' data-mediator='jquery-results-panel'></div>";
        var ANGULAR_MODULE = '<div class="results-panel" data-mediator="results-panel"><results-panel class="content"></results-panel></div>';
        this.element.on("click", function () {
            this.element.toggleClass("toggled");
            $(".results-panel").remove();
            var element, text;
            if (this.element.hasClass("toggled")) {
                element = JQUERY_MODULE;
                text = 'CHANGE TO ANGULAR MODULE';
            } else {
                element = ANGULAR_MODULE;
                text = 'CHANGE TO JQUERY MODULE';
            }
            this.element.html(text);
            $("body").append(element);
        }.bind(this))
    }
}
```

#EventDispatcher Class.
The `EventDispatcher` is your messaging System. It dispatches and listens to `Events` from your Application. 
It's meant to be a Singleton ( EventDispatcher.getInstance() ) in your application, but you can instantiate it as a normal Class.

	
	
###Dependencies


RoboJS depends on **ES5** for

 * Array.prototype.reduce()
 * Array.prototype.map()
 * Array.prototype.filter()



**[bluebird](https://github.com/petkaantonov/bluebird)** and **[Q.js](https://github.com/kriskowal/q)** can be used where native Promise is not implemented.



**[RequireJS](http://requirejs.org/)** is used internally as script loader in `ScriptLoader` Class.
You can override `loader` property of `MediatorsBuilder` instance with your own implementation to load JS.


This is an example how you can set dependencies in AMD with RequireJS

```javascript

requirejs.config({
	paths: {
		Promise: "path/to/any/promise-like/implementation",
        robojs: "../../dist/robojs.min"
	}
});

```

or using Globals

```html
<script src="../../dist/robojs.min.js"></script>
```

If you want use robojs.extensions you need js-suspenders project to be imported.
robojs.extensions provides an Extension System that let you compose your application as you wish.
You can image Extensions as bricks that you put together to create a building.
You can find an example in sample/context folder.
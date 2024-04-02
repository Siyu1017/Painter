/**
 * Code by Wetrain (c) 2023
 * All rights reserved.
 */

"use strict";

var $ = (s, a) => { return a == true ? document.querySelectorAll(s) : document.querySelector(s); };

var dragger = (t, c) => {
    c = c || {};
    if (typeof $(t) !== "object" || $(t) === null) return console.warn("The parameter target type must be a valid HTMLElement.");
    if (c) {
        if (Object.prototype.toString.call(c) !== '[object Object]') return console.warn("The parameter config type must be Object.");
    }
    var target = $(t),
        config = {
            blur: c.blur || window,
            end: c.end || window,
            move: c.move || window
        },
        events = {
            "dragstart": {
                target: target,
                event: ["mousedown", "touchstart"]
            },
            "dragmove": {
                target: config.move,
                event: ["mousemove", "touchmove"]
            },
            "dragend": {
                target: config.end,
                event: ["mouseup", "touchend"]
            },
            "dragout": {
                target: config.blur,
                event: ["blur"]
            }
        };

    function On(evt, fn) {
        if (events.hasOwnProperty(evt) == false) return;
        
            events[evt].event.forEach(event => {
                events[evt].target.addEventListener(event, e => fn(e));
            })
    }

    function offset(el) {
        var rect = el.getBoundingClientRect(),
            scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
            scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
    }

    function getPosition(element) {
        return { x: offset(element).left, y: offset(element).top };
    }

    var listens = {
        "dragin": "dragstart",
        "dragover": "dragover",
        "dragout": "dragleave"
    };

    function Toggle(val) {
        if (val) {
            dragging = val == true;
        } else {
            dragging = dragging == true ? false : true;
        }
    }

    function When(evt, ele, fn) {
        if (listens.hasOwnProperty(evt) == false) return;
        if (ele === null) return;
        ele.addEventListener(listens[evt], e => fn(e));
    }

    return {
        On: On,
        When: When,
        Toggle: Toggle
    }
}
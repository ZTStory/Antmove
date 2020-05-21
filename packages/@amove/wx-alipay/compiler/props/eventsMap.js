// const { useReducer } = require('@amove/next');

const generic = {
    "generic:selectable": "genericSelectable"
};

let eventObj = {
    'bindtap': 'onTap',
    'bindtimeupdate': 'onTimeUpdate',
    'bindlinechange': 'onLineChange',
    'bindtouchstart': 'onTouchStart',
    'bindtouchmove': 'onTouchMove',
    'bindtouchend': 'onTouchEnd',
    'bindtouchcancel': 'onTouchCancel',
    'bindlongtap': 'onLongTap',
    'bindlongpress': 'onLongTap',
    'bindscrolltoupper': 'onScrollToUpper',
    'bindscrolltolower': 'onScrollToLower',
    "catchtouchmove": "catchTouchMove",
    "catchtouchend": "catchTouchEnd",
    "catchtouchcancel": "catchTouchCancel",
    "catchtouchstart": "catchTouchStart"
};

function processEvent (info = {}) {
    let temp = {};
    Object.keys(info)
        .forEach(function (key) {
            let eventName = '';
            if (key.charAt(0) === 'b') {
                eventName = key.substring(4);
            } else {
                eventName = key.substring(5);
            }
            temp[key] = info[key];
            temp['bind:' + eventName] = info[key];
            temp['catch:' + eventName] = info[key].replace(/^on/, 'catch');
            temp['catch' + eventName] = info[key].replace(/^on/, 'catch');
        });
    return temp;
}
module.exports = {
    processEvents (node) {
        let {props, prop} = node.body;
        let key = prop;
        let eventsMap = processEvent(eventObj);
        if (eventsMap[key]) {
            props[eventsMap[key]] = props[key];
            delete props[key];
        } else if (/^bind:(.+)/.test(key) || /^bind(.+)/.test(key)) {
            let newEvent = RegExp.$1;
            let uper = newEvent[0].toUpperCase();
            let eventKey = `on${uper}${newEvent.substring(1)}`;
            props[eventKey] = props[key];
            delete props[key];
        } else if (generic[key]) {
            props[generic[key]] = props[key];
            delete props[key];
        }
    }
};
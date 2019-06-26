!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define(["jquery"],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.jfluxDust=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
var createElement = require("./vdom/create-element.js")

module.exports = createElement

},{"./vdom/create-element.js":14}],3:[function(require,module,exports){
var diff = require("./vtree/diff.js")

module.exports = diff

},{"./vtree/diff.js":34}],4:[function(require,module,exports){
var h = require("./virtual-hyperscript/index.js")

module.exports = h

},{"./virtual-hyperscript/index.js":21}],5:[function(require,module,exports){
/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * ECMAScript compliant, uniform cross-browser split method
 */

/**
 * Splits a string into an array of strings using a regex or string separator. Matches of the
 * separator are not included in the result array. However, if `separator` is a regex that contains
 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
 * cross-browser.
 * @param {String} str String to split.
 * @param {RegExp|String} separator Regex or string to use for separating the string.
 * @param {Number} [limit] Maximum number of items to include in the result array.
 * @returns {Array} Array of substrings.
 * @example
 *
 * // Basic use
 * split('a b c d', ' ');
 * // -> ['a', 'b', 'c', 'd']
 *
 * // With limit
 * split('a b c d', ' ', 2);
 * // -> ['a', 'b']
 *
 * // Backreferences in result array
 * split('..word1 word2..', /([a-z]+)(\d+)/i);
 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
 */
module.exports = (function split(undef) {

  var nativeSplit = String.prototype.split,
    compliantExecNpcg = /()??/.exec("")[1] === undef,
    // NPCG: nonparticipating capturing group
    self;

  self = function(str, separator, limit) {
    // If `separator` is not a regex, use `nativeSplit`
    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
      return nativeSplit.call(str, separator, limit);
    }
    var output = [],
      flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
      (separator.sticky ? "y" : ""),
      // Firefox 3+
      lastLastIndex = 0,
      // Make `global` and avoid `lastIndex` issues by working with a copy
      separator = new RegExp(separator.source, flags + "g"),
      separator2, match, lastIndex, lastLength;
    str += ""; // Type-convert
    if (!compliantExecNpcg) {
      // Doesn't need flags gy, but they don't hurt
      separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
    }
    /* Values for `limit`, per the spec:
     * If undefined: 4294967295 // Math.pow(2, 32) - 1
     * If 0, Infinity, or NaN: 0
     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
     * If other: Type-convert, then use the above rules
     */
    limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
    limit >>> 0; // ToUint32(limit)
    while (match = separator.exec(str)) {
      // `separator.lastIndex` is not reliable cross-browser
      lastIndex = match.index + match[0].length;
      if (lastIndex > lastLastIndex) {
        output.push(str.slice(lastLastIndex, match.index));
        // Fix browsers whose `exec` methods don't consistently return `undefined` for
        // nonparticipating capturing groups
        if (!compliantExecNpcg && match.length > 1) {
          match[0].replace(separator2, function() {
            for (var i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === undef) {
                match[i] = undef;
              }
            }
          });
        }
        if (match.length > 1 && match.index < str.length) {
          Array.prototype.push.apply(output, match.slice(1));
        }
        lastLength = match[0].length;
        lastLastIndex = lastIndex;
        if (output.length >= limit) {
          break;
        }
      }
      if (separator.lastIndex === match.index) {
        separator.lastIndex++; // Avoid an infinite loop
      }
    }
    if (lastLastIndex === str.length) {
      if (lastLength || !separator.test("")) {
        output.push("");
      }
    } else {
      output.push(str.slice(lastLastIndex));
    }
    return output.length > limit ? output.slice(0, limit) : output;
  };

  return self;
})();

},{}],6:[function(require,module,exports){
'use strict';

var OneVersionConstraint = require('individual/one-version');

var MY_VERSION = '7';
OneVersionConstraint('ev-store', MY_VERSION);

var hashKey = '__EV_STORE_KEY@' + MY_VERSION;

module.exports = EvStore;

function EvStore(elem) {
    var hash = elem[hashKey];

    if (!hash) {
        hash = elem[hashKey] = {};
    }

    return hash;
}

},{"individual/one-version":8}],7:[function(require,module,exports){
(function (global){
'use strict';

/*global window, global*/

var root = typeof window !== 'undefined' ?
    window : typeof global !== 'undefined' ?
    global : {};

module.exports = Individual;

function Individual(key, value) {
    if (key in root) {
        return root[key];
    }

    root[key] = value;

    return value;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(require,module,exports){
'use strict';

var Individual = require('./index.js');

module.exports = OneVersion;

function OneVersion(moduleName, version, defaultValue) {
    var key = '__INDIVIDUAL_ONE_VERSION_' + moduleName;
    var enforceKey = key + '_ENFORCE_SINGLETON';

    var versionValue = Individual(enforceKey, version);

    if (versionValue !== version) {
        throw new Error('Can only have one copy of ' +
            moduleName + '.\n' +
            'You already have version ' + versionValue +
            ' installed.\n' +
            'This means you cannot install version ' + version);
    }

    return Individual(key, defaultValue);
}

},{"./index.js":7}],9:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":1}],10:[function(require,module,exports){
"use strict";

module.exports = function isObject(x) {
	return typeof x === "object" && x !== null;
};

},{}],11:[function(require,module,exports){
var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}

},{}],12:[function(require,module,exports){
var patch = require("./vdom/patch.js")

module.exports = patch

},{"./vdom/patch.js":17}],13:[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook.js")

module.exports = applyProperties

function applyProperties(node, props, previous) {
    for (var propName in props) {
        var propValue = props[propName]

        if (propValue === undefined) {
            removeProperty(node, propName, propValue, previous);
        } else if (isHook(propValue)) {
            removeProperty(node, propName, propValue, previous)
            if (propValue.hook) {
                propValue.hook(node,
                    propName,
                    previous ? previous[propName] : undefined)
            }
        } else {
            if (isObject(propValue)) {
                patchObject(node, props, previous, propName, propValue);
            } else {
                node[propName] = propValue
            }
        }
    }
}

function removeProperty(node, propName, propValue, previous) {
    if (previous) {
        var previousValue = previous[propName]

        if (!isHook(previousValue)) {
            if (propName === "attributes") {
                for (var attrName in previousValue) {
                    node.removeAttribute(attrName)
                }
            } else if (propName === "style") {
                for (var i in previousValue) {
                    node.style[i] = ""
                }
            } else if (typeof previousValue === "string") {
                node[propName] = ""
            } else {
                node[propName] = null
            }
        } else if (previousValue.unhook) {
            previousValue.unhook(node, propName, propValue)
        }
    }
}

function patchObject(node, props, previous, propName, propValue) {
    var previousValue = previous ? previous[propName] : undefined

    // Set attributes
    if (propName === "attributes") {
        for (var attrName in propValue) {
            var attrValue = propValue[attrName]

            if (attrValue === undefined) {
                node.removeAttribute(attrName)
            } else {
                node.setAttribute(attrName, attrValue)
            }
        }

        return
    }

    if(previousValue && isObject(previousValue) &&
        getPrototype(previousValue) !== getPrototype(propValue)) {
        node[propName] = propValue
        return
    }

    if (!isObject(node[propName])) {
        node[propName] = {}
    }

    var replacer = propName === "style" ? "" : undefined

    for (var k in propValue) {
        var value = propValue[k]
        node[propName][k] = (value === undefined) ? replacer : value
    }
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}

},{"../vnode/is-vhook.js":25,"is-object":10}],14:[function(require,module,exports){
var document = require("global/document")

var applyProperties = require("./apply-properties")

var isVNode = require("../vnode/is-vnode.js")
var isVText = require("../vnode/is-vtext.js")
var isWidget = require("../vnode/is-widget.js")
var handleThunk = require("../vnode/handle-thunk.js")

module.exports = createElement

function createElement(vnode, opts) {
    var doc = opts ? opts.document || document : document
    var warn = opts ? opts.warn : null

    vnode = handleThunk(vnode).a

    if (isWidget(vnode)) {
        return vnode.init()
    } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text)
    } else if (!isVNode(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode)
        }
        return null
    }

    var node = (vnode.namespace === null) ?
        doc.createElement(vnode.tagName) :
        doc.createElementNS(vnode.namespace, vnode.tagName)

    var props = vnode.properties
    applyProperties(node, props)

    var children = vnode.children

    for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts)
        if (childNode) {
            node.appendChild(childNode)
        }
    }

    return node
}

},{"../vnode/handle-thunk.js":23,"../vnode/is-vnode.js":26,"../vnode/is-vtext.js":27,"../vnode/is-widget.js":28,"./apply-properties":13,"global/document":9}],15:[function(require,module,exports){
// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

var noChild = {}

module.exports = domIndex

function domIndex(rootNode, tree, indices, nodes) {
    if (!indices || indices.length === 0) {
        return {}
    } else {
        indices.sort(ascending)
        return recurse(rootNode, tree, indices, nodes, 0)
    }
}

function recurse(rootNode, tree, indices, nodes, rootIndex) {
    nodes = nodes || {}


    if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode
        }

        var vChildren = tree.children

        if (vChildren) {

            var childNodes = rootNode.childNodes

            for (var i = 0; i < tree.children.length; i++) {
                rootIndex += 1

                var vChild = vChildren[i] || noChild
                var nextIndex = rootIndex + (vChild.count || 0)

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex)
                }

                rootIndex = nextIndex
            }
        }
    }

    return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false
    }

    var minIndex = 0
    var maxIndex = indices.length - 1
    var currentIndex
    var currentItem

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0
        currentItem = indices[currentIndex]

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right
        } else if (currentItem < left) {
            minIndex = currentIndex + 1
        } else  if (currentItem > right) {
            maxIndex = currentIndex - 1
        } else {
            return true
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b ? 1 : -1
}

},{}],16:[function(require,module,exports){
var applyProperties = require("./apply-properties")

var isWidget = require("../vnode/is-widget.js")
var VPatch = require("../vnode/vpatch.js")

var updateWidget = require("./update-widget")

module.exports = applyPatch

function applyPatch(vpatch, domNode, renderOptions) {
    var type = vpatch.type
    var vNode = vpatch.vNode
    var patch = vpatch.patch

    switch (type) {
        case VPatch.REMOVE:
            return removeNode(domNode, vNode)
        case VPatch.INSERT:
            return insertNode(domNode, patch, renderOptions)
        case VPatch.VTEXT:
            return stringPatch(domNode, vNode, patch, renderOptions)
        case VPatch.WIDGET:
            return widgetPatch(domNode, vNode, patch, renderOptions)
        case VPatch.VNODE:
            return vNodePatch(domNode, vNode, patch, renderOptions)
        case VPatch.ORDER:
            reorderChildren(domNode, patch)
            return domNode
        case VPatch.PROPS:
            applyProperties(domNode, patch, vNode.properties)
            return domNode
        case VPatch.THUNK:
            return replaceRoot(domNode,
                renderOptions.patch(domNode, patch, renderOptions))
        default:
            return domNode
    }
}

function removeNode(domNode, vNode) {
    var parentNode = domNode.parentNode

    if (parentNode) {
        parentNode.removeChild(domNode)
    }

    destroyWidget(domNode, vNode);

    return null
}

function insertNode(parentNode, vNode, renderOptions) {
    var newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function stringPatch(domNode, leftVNode, vText, renderOptions) {
    var newNode

    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, vText.text)
        newNode = domNode
    } else {
        var parentNode = domNode.parentNode
        newNode = renderOptions.render(vText, renderOptions)

        if (parentNode && newNode !== domNode) {
            parentNode.replaceChild(newNode, domNode)
        }
    }

    return newNode
}

function widgetPatch(domNode, leftVNode, widget, renderOptions) {
    var updating = updateWidget(leftVNode, widget)
    var newNode

    if (updating) {
        newNode = widget.update(leftVNode, domNode) || domNode
    } else {
        newNode = renderOptions.render(widget, renderOptions)
    }

    var parentNode = domNode.parentNode

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    if (!updating) {
        destroyWidget(domNode, leftVNode)
    }

    return newNode
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
    var parentNode = domNode.parentNode
    var newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    return newNode
}

function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode)
    }
}

function reorderChildren(domNode, moves) {
    var childNodes = domNode.childNodes
    var keyMap = {}
    var node
    var remove
    var insert

    for (var i = 0; i < moves.removes.length; i++) {
        remove = moves.removes[i]
        node = childNodes[remove.from]
        if (remove.key) {
            keyMap[remove.key] = node
        }
        domNode.removeChild(node)
    }

    var length = childNodes.length
    for (var j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j]
        node = keyMap[insert.key]
        // this is the weirdest bug i've ever seen in webkit
        domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to])
    }
}

function replaceRoot(oldRoot, newRoot) {
    if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
        oldRoot.parentNode.replaceChild(newRoot, oldRoot)
    }

    return newRoot;
}

},{"../vnode/is-widget.js":28,"../vnode/vpatch.js":31,"./apply-properties":13,"./update-widget":18}],17:[function(require,module,exports){
var document = require("global/document")
var isArray = require("x-is-array")

var render = require("./create-element")
var domIndex = require("./dom-index")
var patchOp = require("./patch-op")
module.exports = patch

function patch(rootNode, patches, renderOptions) {
    renderOptions = renderOptions || {}
    renderOptions.patch = renderOptions.patch || patchRecursive
    renderOptions.render = renderOptions.render || render

    return renderOptions.patch(rootNode, patches, renderOptions)
}

function patchRecursive(rootNode, patches, renderOptions) {
    var indices = patchIndices(patches)

    if (indices.length === 0) {
        return rootNode
    }

    var index = domIndex(rootNode, patches.a, indices)
    var ownerDocument = rootNode.ownerDocument

    if (!renderOptions.document && ownerDocument !== document) {
        renderOptions.document = ownerDocument
    }

    for (var i = 0; i < indices.length; i++) {
        var nodeIndex = indices[i]
        rootNode = applyPatch(rootNode,
            index[nodeIndex],
            patches[nodeIndex],
            renderOptions)
    }

    return rootNode
}

function applyPatch(rootNode, domNode, patchList, renderOptions) {
    if (!domNode) {
        return rootNode
    }

    var newNode

    if (isArray(patchList)) {
        for (var i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], domNode, renderOptions)

            if (domNode === rootNode) {
                rootNode = newNode
            }
        }
    } else {
        newNode = patchOp(patchList, domNode, renderOptions)

        if (domNode === rootNode) {
            rootNode = newNode
        }
    }

    return rootNode
}

function patchIndices(patches) {
    var indices = []

    for (var key in patches) {
        if (key !== "a") {
            indices.push(Number(key))
        }
    }

    return indices
}

},{"./create-element":14,"./dom-index":15,"./patch-op":16,"global/document":9,"x-is-array":11}],18:[function(require,module,exports){
var isWidget = require("../vnode/is-widget.js")

module.exports = updateWidget

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("name" in a && "name" in b) {
            return a.id === b.id
        } else {
            return a.init === b.init
        }
    }

    return false
}

},{"../vnode/is-widget.js":28}],19:[function(require,module,exports){
'use strict';

var EvStore = require('ev-store');

module.exports = EvHook;

function EvHook(value) {
    if (!(this instanceof EvHook)) {
        return new EvHook(value);
    }

    this.value = value;
}

EvHook.prototype.hook = function (node, propertyName) {
    var es = EvStore(node);
    var propName = propertyName.substr(3);

    es[propName] = this.value;
};

EvHook.prototype.unhook = function(node, propertyName) {
    var es = EvStore(node);
    var propName = propertyName.substr(3);

    es[propName] = undefined;
};

},{"ev-store":6}],20:[function(require,module,exports){
'use strict';

module.exports = SoftSetHook;

function SoftSetHook(value) {
    if (!(this instanceof SoftSetHook)) {
        return new SoftSetHook(value);
    }

    this.value = value;
}

SoftSetHook.prototype.hook = function (node, propertyName) {
    if (node[propertyName] !== this.value) {
        node[propertyName] = this.value;
    }
};

},{}],21:[function(require,module,exports){
'use strict';

var isArray = require('x-is-array');

var VNode = require('../vnode/vnode.js');
var VText = require('../vnode/vtext.js');
var isVNode = require('../vnode/is-vnode');
var isVText = require('../vnode/is-vtext');
var isWidget = require('../vnode/is-widget');
var isHook = require('../vnode/is-vhook');
var isVThunk = require('../vnode/is-thunk');

var parseTag = require('./parse-tag.js');
var softSetHook = require('./hooks/soft-set-hook.js');
var evHook = require('./hooks/ev-hook.js');

module.exports = h;

function h(tagName, properties, children) {
    var childNodes = [];
    var tag, props, key, namespace;

    if (!children && isChildren(properties)) {
        children = properties;
        props = {};
    }

    props = props || properties || {};
    tag = parseTag(tagName, props);

    // support keys
    if (props.hasOwnProperty('key')) {
        key = props.key;
        props.key = undefined;
    }

    // support namespace
    if (props.hasOwnProperty('namespace')) {
        namespace = props.namespace;
        props.namespace = undefined;
    }

    // fix cursor bug
    if (tag === 'INPUT' &&
        !namespace &&
        props.hasOwnProperty('value') &&
        props.value !== undefined &&
        !isHook(props.value)
    ) {
        props.value = softSetHook(props.value);
    }

    transformProperties(props);

    if (children !== undefined && children !== null) {
        addChild(children, childNodes, tag, props);
    }


    return new VNode(tag, props, childNodes, key, namespace);
}

function addChild(c, childNodes, tag, props) {
    if (typeof c === 'string') {
        childNodes.push(new VText(c));
    } else if (typeof c === 'number') {
        childNodes.push(new VText(String(c)));
    } else if (isChild(c)) {
        childNodes.push(c);
    } else if (isArray(c)) {
        for (var i = 0; i < c.length; i++) {
            addChild(c[i], childNodes, tag, props);
        }
    } else if (c === null || c === undefined) {
        return;
    } else {
        throw UnexpectedVirtualElement({
            foreignObject: c,
            parentVnode: {
                tagName: tag,
                properties: props
            }
        });
    }
}

function transformProperties(props) {
    for (var propName in props) {
        if (props.hasOwnProperty(propName)) {
            var value = props[propName];

            if (isHook(value)) {
                continue;
            }

            if (propName.substr(0, 3) === 'ev-') {
                // add ev-foo support
                props[propName] = evHook(value);
            }
        }
    }
}

function isChild(x) {
    return isVNode(x) || isVText(x) || isWidget(x) || isVThunk(x);
}

function isChildren(x) {
    return typeof x === 'string' || isArray(x) || isChild(x);
}

function UnexpectedVirtualElement(data) {
    var err = new Error();

    err.type = 'virtual-hyperscript.unexpected.virtual-element';
    err.message = 'Unexpected virtual child passed to h().\n' +
        'Expected a VNode / Vthunk / VWidget / string but:\n' +
        'got:\n' +
        errorString(data.foreignObject) +
        '.\n' +
        'The parent vnode is:\n' +
        errorString(data.parentVnode)
        '\n' +
        'Suggested fix: change your `h(..., [ ... ])` callsite.';
    err.foreignObject = data.foreignObject;
    err.parentVnode = data.parentVnode;

    return err;
}

function errorString(obj) {
    try {
        return JSON.stringify(obj, null, '    ');
    } catch (e) {
        return String(obj);
    }
}

},{"../vnode/is-thunk":24,"../vnode/is-vhook":25,"../vnode/is-vnode":26,"../vnode/is-vtext":27,"../vnode/is-widget":28,"../vnode/vnode.js":30,"../vnode/vtext.js":32,"./hooks/ev-hook.js":19,"./hooks/soft-set-hook.js":20,"./parse-tag.js":22,"x-is-array":11}],22:[function(require,module,exports){
'use strict';

var split = require('browser-split');

var classIdSplit = /([\.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/;
var notClassId = /^\.|#/;

module.exports = parseTag;

function parseTag(tag, props) {
    if (!tag) {
        return 'DIV';
    }

    var noId = !(props.hasOwnProperty('id'));

    var tagParts = split(tag, classIdSplit);
    var tagName = null;

    if (notClassId.test(tagParts[1])) {
        tagName = 'DIV';
    }

    var classes, part, type, i;

    for (i = 0; i < tagParts.length; i++) {
        part = tagParts[i];

        if (!part) {
            continue;
        }

        type = part.charAt(0);

        if (!tagName) {
            tagName = part;
        } else if (type === '.') {
            classes = classes || [];
            classes.push(part.substring(1, part.length));
        } else if (type === '#' && noId) {
            props.id = part.substring(1, part.length);
        }
    }

    if (classes) {
        if (props.className) {
            classes.push(props.className);
        }

        props.className = classes.join(' ');
    }

    return props.namespace ? tagName : tagName.toUpperCase();
}

},{"browser-split":5}],23:[function(require,module,exports){
var isVNode = require("./is-vnode")
var isVText = require("./is-vtext")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")

module.exports = handleThunk

function handleThunk(a, b) {
    var renderedA = a
    var renderedB = b

    if (isThunk(b)) {
        renderedB = renderThunk(b, a)
    }

    if (isThunk(a)) {
        renderedA = renderThunk(a, null)
    }

    return {
        a: renderedA,
        b: renderedB
    }
}

function renderThunk(thunk, previous) {
    var renderedThunk = thunk.vnode

    if (!renderedThunk) {
        renderedThunk = thunk.vnode = thunk.render(previous)
    }

    if (!(isVNode(renderedThunk) ||
            isVText(renderedThunk) ||
            isWidget(renderedThunk))) {
        throw new Error("thunk did not return a valid node");
    }

    return renderedThunk
}

},{"./is-thunk":24,"./is-vnode":26,"./is-vtext":27,"./is-widget":28}],24:[function(require,module,exports){
module.exports = isThunk

function isThunk(t) {
    return t && t.type === "Thunk"
}

},{}],25:[function(require,module,exports){
module.exports = isHook

function isHook(hook) {
    return hook &&
      (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
       typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
}

},{}],26:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}

},{"./version":29}],27:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualText

function isVirtualText(x) {
    return x && x.type === "VirtualText" && x.version === version
}

},{"./version":29}],28:[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && w.type === "Widget"
}

},{}],29:[function(require,module,exports){
module.exports = "2"

},{}],30:[function(require,module,exports){
var version = require("./version")
var isVNode = require("./is-vnode")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")
var isVHook = require("./is-vhook")

module.exports = VirtualNode

var noProperties = {}
var noChildren = []

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName
    this.properties = properties || noProperties
    this.children = children || noChildren
    this.key = key != null ? String(key) : undefined
    this.namespace = (typeof namespace === "string") ? namespace : null

    var count = (children && children.length) || 0
    var descendants = 0
    var hasWidgets = false
    var hasThunks = false
    var descendantHooks = false
    var hooks

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName]
            if (isVHook(property) && property.unhook) {
                if (!hooks) {
                    hooks = {}
                }

                hooks[propName] = property
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i]
        if (isVNode(child)) {
            descendants += child.count || 0

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true
            }

            if (!hasThunks && child.hasThunks) {
                hasThunks = true
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true
            }
        } else if (!hasWidgets && isWidget(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true
            }
        } else if (!hasThunks && isThunk(child)) {
            hasThunks = true;
        }
    }

    this.count = count + descendants
    this.hasWidgets = hasWidgets
    this.hasThunks = hasThunks
    this.hooks = hooks
    this.descendantHooks = descendantHooks
}

VirtualNode.prototype.version = version
VirtualNode.prototype.type = "VirtualNode"

},{"./is-thunk":24,"./is-vhook":25,"./is-vnode":26,"./is-widget":28,"./version":29}],31:[function(require,module,exports){
var version = require("./version")

VirtualPatch.NONE = 0
VirtualPatch.VTEXT = 1
VirtualPatch.VNODE = 2
VirtualPatch.WIDGET = 3
VirtualPatch.PROPS = 4
VirtualPatch.ORDER = 5
VirtualPatch.INSERT = 6
VirtualPatch.REMOVE = 7
VirtualPatch.THUNK = 8

module.exports = VirtualPatch

function VirtualPatch(type, vNode, patch) {
    this.type = Number(type)
    this.vNode = vNode
    this.patch = patch
}

VirtualPatch.prototype.version = version
VirtualPatch.prototype.type = "VirtualPatch"

},{"./version":29}],32:[function(require,module,exports){
var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"

},{"./version":29}],33:[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook")

module.exports = diffProps

function diffProps(a, b) {
    var diff

    for (var aKey in a) {
        if (!(aKey in b)) {
            diff = diff || {}
            diff[aKey] = undefined
        }

        var aValue = a[aKey]
        var bValue = b[aKey]

        if (aValue === bValue) {
            continue
        } else if (isObject(aValue) && isObject(bValue)) {
            if (getPrototype(bValue) !== getPrototype(aValue)) {
                diff = diff || {}
                diff[aKey] = bValue
            } else if (isHook(bValue)) {
                 diff = diff || {}
                 diff[aKey] = bValue
            } else {
                var objectDiff = diffProps(aValue, bValue)
                if (objectDiff) {
                    diff = diff || {}
                    diff[aKey] = objectDiff
                }
            }
        } else {
            diff = diff || {}
            diff[aKey] = bValue
        }
    }

    for (var bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {}
            diff[bKey] = b[bKey]
        }
    }

    return diff
}

function getPrototype(value) {
  if (Object.getPrototypeOf) {
    return Object.getPrototypeOf(value)
  } else if (value.__proto__) {
    return value.__proto__
  } else if (value.constructor) {
    return value.constructor.prototype
  }
}

},{"../vnode/is-vhook":25,"is-object":10}],34:[function(require,module,exports){
var isArray = require("x-is-array")

var VPatch = require("../vnode/vpatch")
var isVNode = require("../vnode/is-vnode")
var isVText = require("../vnode/is-vtext")
var isWidget = require("../vnode/is-widget")
var isThunk = require("../vnode/is-thunk")
var handleThunk = require("../vnode/handle-thunk")

var diffProps = require("./diff-props")

module.exports = diff

function diff(a, b) {
    var patch = { a: a }
    walk(a, b, patch, 0)
    return patch
}

function walk(a, b, patch, index) {
    if (a === b) {
        return
    }

    var apply = patch[index]
    var applyClear = false

    if (isThunk(a) || isThunk(b)) {
        thunks(a, b, patch, index)
    } else if (b == null) {

        // If a is a widget we will add a remove patch for it
        // Otherwise any child widgets/hooks must be destroyed.
        // This prevents adding two remove patches for a widget.
        if (!isWidget(a)) {
            clearState(a, patch, index)
            apply = patch[index]
        }

        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b))
    } else if (isVNode(b)) {
        if (isVNode(a)) {
            if (a.tagName === b.tagName &&
                a.namespace === b.namespace &&
                a.key === b.key) {
                var propsPatch = diffProps(a.properties, b.properties)
                if (propsPatch) {
                    apply = appendPatch(apply,
                        new VPatch(VPatch.PROPS, a, propsPatch))
                }
                apply = diffChildren(a, b, patch, apply, index)
            } else {
                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
                applyClear = true
            }
        } else {
            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
            applyClear = true
        }
    } else if (isVText(b)) {
        if (!isVText(a)) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
            applyClear = true
        } else if (a.text !== b.text) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
        }
    } else if (isWidget(b)) {
        if (!isWidget(a)) {
            applyClear = true
        }

        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b))
    }

    if (apply) {
        patch[index] = apply
    }

    if (applyClear) {
        clearState(a, patch, index)
    }
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children
    var orderedSet = reorder(aChildren, b.children)
    var bChildren = orderedSet.children

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i]
        var rightNode = bChildren[i]
        index += 1

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply,
                    new VPatch(VPatch.INSERT, null, rightNode))
            }
        } else {
            walk(leftNode, rightNode, patch, index)
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }

    if (orderedSet.moves) {
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(
            VPatch.ORDER,
            a,
            orderedSet.moves
        ))
    }

    return apply
}

function clearState(vNode, patch, index) {
    // TODO: Make this a single walk, not two
    unhook(vNode, patch, index)
    destroyWidgets(vNode, patch, index)
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(VPatch.REMOVE, vNode, null)
            )
        }
    } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
        var children = vNode.children
        var len = children.length
        for (var i = 0; i < len; i++) {
            var child = children[i]
            index += 1

            destroyWidgets(child, patch, index)

            if (isVNode(child) && child.count) {
                index += child.count
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

// Create a sub-patch for thunks
function thunks(a, b, patch, index) {
    var nodes = handleThunk(a, b)
    var thunkPatch = diff(nodes.a, nodes.b)
    if (hasPatches(thunkPatch)) {
        patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch)
    }
}

function hasPatches(patch) {
    for (var index in patch) {
        if (index !== "a") {
            return true
        }
    }

    return false
}

// Execute hooks when two nodes are identical
function unhook(vNode, patch, index) {
    if (isVNode(vNode)) {
        if (vNode.hooks) {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(
                    VPatch.PROPS,
                    vNode,
                    undefinedKeys(vNode.hooks)
                )
            )
        }

        if (vNode.descendantHooks || vNode.hasThunks) {
            var children = vNode.children
            var len = children.length
            for (var i = 0; i < len; i++) {
                var child = children[i]
                index += 1

                unhook(child, patch, index)

                if (isVNode(child) && child.count) {
                    index += child.count
                }
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

function undefinedKeys(obj) {
    var result = {}

    for (var key in obj) {
        result[key] = undefined
    }

    return result
}

// List diff, naive left to right reordering
function reorder(aChildren, bChildren) {
    // O(M) time, O(M) memory
    var bChildIndex = keyIndex(bChildren)
    var bKeys = bChildIndex.keys
    var bFree = bChildIndex.free

    if (bFree.length === bChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(N) time, O(N) memory
    var aChildIndex = keyIndex(aChildren)
    var aKeys = aChildIndex.keys
    var aFree = aChildIndex.free

    if (aFree.length === aChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(MAX(N, M)) memory
    var newChildren = []

    var freeIndex = 0
    var freeCount = bFree.length
    var deletedItems = 0

    // Iterate through a and match a node in b
    // O(N) time,
    for (var i = 0 ; i < aChildren.length; i++) {
        var aItem = aChildren[i]
        var itemIndex

        if (aItem.key) {
            if (bKeys.hasOwnProperty(aItem.key)) {
                // Match up the old keys
                itemIndex = bKeys[aItem.key]
                newChildren.push(bChildren[itemIndex])

            } else {
                // Remove old keyed items
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        } else {
            // Match the item in a with the next free item in b
            if (freeIndex < freeCount) {
                itemIndex = bFree[freeIndex++]
                newChildren.push(bChildren[itemIndex])
            } else {
                // There are no free items in b to match with
                // the free items in a, so the extra free nodes
                // are deleted.
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        }
    }

    var lastFreeIndex = freeIndex >= bFree.length ?
        bChildren.length :
        bFree[freeIndex]

    // Iterate through b and append any new keys
    // O(M) time
    for (var j = 0; j < bChildren.length; j++) {
        var newItem = bChildren[j]

        if (newItem.key) {
            if (!aKeys.hasOwnProperty(newItem.key)) {
                // Add any new keyed items
                // We are adding new items to the end and then sorting them
                // in place. In future we should insert new items in place.
                newChildren.push(newItem)
            }
        } else if (j >= lastFreeIndex) {
            // Add any leftover non-keyed items
            newChildren.push(newItem)
        }
    }

    var simulate = newChildren.slice()
    var simulateIndex = 0
    var removes = []
    var inserts = []
    var simulateItem

    for (var k = 0; k < bChildren.length;) {
        var wantedItem = bChildren[k]
        simulateItem = simulate[simulateIndex]

        // remove items
        while (simulateItem === null && simulate.length) {
            removes.push(remove(simulate, simulateIndex, null))
            simulateItem = simulate[simulateIndex]
        }

        if (!simulateItem || simulateItem.key !== wantedItem.key) {
            // if we need a key in this position...
            if (wantedItem.key) {
                if (simulateItem && simulateItem.key) {
                    // if an insert doesn't put this key in place, it needs to move
                    if (bKeys[simulateItem.key] !== k + 1) {
                        removes.push(remove(simulate, simulateIndex, simulateItem.key))
                        simulateItem = simulate[simulateIndex]
                        // if the remove didn't put the wanted item in place, we need to insert it
                        if (!simulateItem || simulateItem.key !== wantedItem.key) {
                            inserts.push({key: wantedItem.key, to: k})
                        }
                        // items are matching, so skip ahead
                        else {
                            simulateIndex++
                        }
                    }
                    else {
                        inserts.push({key: wantedItem.key, to: k})
                    }
                }
                else {
                    inserts.push({key: wantedItem.key, to: k})
                }
                k++
            }
            // a key in simulate has no matching wanted key, remove it
            else if (simulateItem && simulateItem.key) {
                removes.push(remove(simulate, simulateIndex, simulateItem.key))
            }
        }
        else {
            simulateIndex++
            k++
        }
    }

    // remove all the remaining nodes from simulate
    while(simulateIndex < simulate.length) {
        simulateItem = simulate[simulateIndex]
        removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key))
    }

    // If the only moves we have are deletes then we can just
    // let the delete patch remove these items.
    if (removes.length === deletedItems && !inserts.length) {
        return {
            children: newChildren,
            moves: null
        }
    }

    return {
        children: newChildren,
        moves: {
            removes: removes,
            inserts: inserts
        }
    }
}

function remove(arr, index, key) {
    arr.splice(index, 1)

    return {
        from: index,
        key: key
    }
}

function keyIndex(children) {
    var keys = {}
    var free = []
    var length = children.length

    for (var i = 0; i < length; i++) {
        var child = children[i]

        if (child.key) {
            keys[child.key] = i
        } else {
            free.push(i)
        }
    }

    return {
        keys: keys,     // A hash of key name to index
        free: free      // An array of unkeyed item indices
    }
}

function appendPatch(apply, patch) {
    if (apply) {
        if (isArray(apply)) {
            apply.push(patch)
        } else {
            apply = [apply, patch]
        }

        return apply
    } else {
        return patch
    }
}

},{"../vnode/handle-thunk":23,"../vnode/is-thunk":24,"../vnode/is-vnode":26,"../vnode/is-vtext":27,"../vnode/is-widget":28,"../vnode/vpatch":31,"./diff-props":33,"x-is-array":11}],35:[function(require,module,exports){
/*!
 * EventEmitter v4.2.8 - git.io/ee
 * Oliver Caldwell
 * MIT license
 * @preserve
 */

module.exports = (function () {
    'use strict';

    /**
     * Class for managing events.
     * Can be extended to provide event functionality in other classes.
     *
     * @class EventEmitter Manages event registering and emitting.
     */
    function EventEmitter() {}

    // Shortcuts to improve speed and size
    var proto = EventEmitter.prototype;
    var exports = this;
    var originalGlobalValue = exports.EventEmitter;

    /**
     * Finds the index of the listener for the event in its storage array.
     *
     * @param {Function[]} listeners Array of listeners to search through.
     * @param {Function} listener Method to look for.
     * @return {Number} Index of the specified listener, -1 if not found
     * @api private
     */
    function indexOfListener(listeners, listener) {
        var i = listeners.length;
        while (i--) {
            if (listeners[i].listener === listener) {
                return i;
            }
        }

        return -1;
    }

    /**
     * Alias a method while keeping the context correct, to allow for overwriting of target method.
     *
     * @param {String} name The name of the target method.
     * @return {Function} The aliased method
     * @api private
     */
    function alias(name) {
        return function aliasClosure() {
            return this[name].apply(this, arguments);
        };
    }

    /**
     * Returns the listener array for the specified event.
     * Will initialise the event object and listener arrays if required.
     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
     * Each property in the object response is an array of listener functions.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Function[]|Object} All listener functions for the event.
     */
    proto.getListeners = function getListeners(evt) {
        var events = this._getEvents();
        var response;
        var key;

        // Return a concatenated array of all matching events if
        // the selector is a regular expression.
        if (evt instanceof RegExp) {
            response = {};
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    response[key] = events[key];
                }
            }
        }
        else {
            response = events[evt] || (events[evt] = []);
        }

        return response;
    };

    /**
     * Takes a list of listener objects and flattens it into a list of listener functions.
     *
     * @param {Object[]} listeners Raw listener objects.
     * @return {Function[]} Just the listener functions.
     */
    proto.flattenListeners = function flattenListeners(listeners) {
        var flatListeners = [];
        var i;

        for (i = 0; i < listeners.length; i += 1) {
            flatListeners.push(listeners[i].listener);
        }

        return flatListeners;
    };

    /**
     * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Object} All listener functions for an event in an object.
     */
    proto.getListenersAsObject = function getListenersAsObject(evt) {
        var listeners = this.getListeners(evt);
        var response;

        if (listeners instanceof Array) {
            response = {};
            response[evt] = listeners;
        }

        return response || listeners;
    };

    /**
     * Adds a listener function to the specified event.
     * The listener will not be added if it is a duplicate.
     * If the listener returns true then it will be removed after it is called.
     * If you pass a regular expression as the event name then the listener will be added to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListener = function addListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var listenerIsWrapped = typeof listener === 'object';
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
                listeners[key].push(listenerIsWrapped ? listener : {
                    listener: listener,
                    once: false
                });
            }
        }

        return this;
    };

    /**
     * Alias of addListener
     */
    proto.on = alias('addListener');

    /**
     * Semi-alias of addListener. It will add a listener that will be
     * automatically removed after its first execution.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addOnceListener = function addOnceListener(evt, listener) {
        return this.addListener(evt, {
            listener: listener,
            once: true
        });
    };

    /**
     * Alias of addOnceListener.
     */
    proto.once = alias('addOnceListener');

    /**
     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
     * You need to tell it what event names should be matched by a regex.
     *
     * @param {String} evt Name of the event to create.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvent = function defineEvent(evt) {
        this.getListeners(evt);
        return this;
    };

    /**
     * Uses defineEvent to define multiple events.
     *
     * @param {String[]} evts An array of event names to define.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvents = function defineEvents(evts) {
        for (var i = 0; i < evts.length; i += 1) {
            this.defineEvent(evts[i]);
        }
        return this;
    };

    /**
     * Removes a listener function from the specified event.
     * When passed a regular expression as the event name, it will remove the listener from all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to remove the listener from.
     * @param {Function} listener Method to remove from the event.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListener = function removeListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var index;
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                index = indexOfListener(listeners[key], listener);

                if (index !== -1) {
                    listeners[key].splice(index, 1);
                }
            }
        }

        return this;
    };

    /**
     * Alias of removeListener
     */
    proto.off = alias('removeListener');

    /**
     * Adds listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
     * You can also pass it a regular expression to add the array of listeners to all events that match it.
     * Yeah, this function does quite a bit. That's probably a bad thing.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListeners = function addListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(false, evt, listeners);
    };

    /**
     * Removes listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be removed.
     * You can also pass it a regular expression to remove the listeners from all events that match it.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListeners = function removeListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(true, evt, listeners);
    };

    /**
     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
     * The first argument will determine if the listeners are removed (true) or added (false).
     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be added/removed.
     * You can also pass it a regular expression to manipulate the listeners of all events that match it.
     *
     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
        var i;
        var value;
        var single = remove ? this.removeListener : this.addListener;
        var multiple = remove ? this.removeListeners : this.addListeners;

        // If evt is an object then pass each of its properties to this method
        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
            for (i in evt) {
                if (evt.hasOwnProperty(i) && (value = evt[i])) {
                    // Pass the single listener straight through to the singular method
                    if (typeof value === 'function') {
                        single.call(this, i, value);
                    }
                    else {
                        // Otherwise pass back to the multiple function
                        multiple.call(this, i, value);
                    }
                }
            }
        }
        else {
            // So evt must be a string
            // And listeners must be an array of listeners
            // Loop over it and pass each one to the multiple method
            i = listeners.length;
            while (i--) {
                single.call(this, evt, listeners[i]);
            }
        }

        return this;
    };

    /**
     * Removes all listeners from a specified event.
     * If you do not specify an event then all listeners will be removed.
     * That means every event will be emptied.
     * You can also pass a regex to remove all events that match it.
     *
     * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeEvent = function removeEvent(evt) {
        var type = typeof evt;
        var events = this._getEvents();
        var key;

        // Remove different things depending on the state of evt
        if (type === 'string') {
            // Remove all listeners for the specified event
            delete events[evt];
        }
        else if (evt instanceof RegExp) {
            // Remove all events matching the regex.
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    delete events[key];
                }
            }
        }
        else {
            // Remove all listeners in all events
            delete this._events;
        }

        return this;
    };

    /**
     * Alias of removeEvent.
     *
     * Added to mirror the node API.
     */
    proto.removeAllListeners = alias('removeEvent');

    /**
     * Emits an event of your choice.
     * When emitted, every listener attached to that event will be executed.
     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
     * So they will not arrive within the array on the other side, they will be separate.
     * You can also pass a regular expression to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {Array} [args] Optional array of arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emitEvent = function emitEvent(evt, args) {
        var listeners = this.getListenersAsObject(evt);
        var listener;
        var i;
        var key;
        var response;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                i = listeners[key].length;

                while (i--) {
                    // If the listener returns true then it shall be removed from the event
                    // The function is executed either with a basic call or an apply if there is an args array
                    listener = listeners[key][i];

                    if (listener.once === true) {
                        this.removeListener(evt, listener.listener);
                    }

                    response = listener.listener.apply(this, args || []);

                    if (response === this._getOnceReturnValue()) {
                        this.removeListener(evt, listener.listener);
                    }
                }
            }
        }

        return this;
    };

    /**
     * Alias of emitEvent
     */
    proto.trigger = alias('emitEvent');

    /**
     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
     * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {...*} Optional additional arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emit = function emit(evt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(evt, args);
    };

    /**
     * Sets the current value to check against when executing listeners. If a
     * listeners return value matches the one set here then it will be removed
     * after execution. This value defaults to true.
     *
     * @param {*} value The new value to check for when executing listeners.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.setOnceReturnValue = function setOnceReturnValue(value) {
        this._onceReturnValue = value;
        return this;
    };

    /**
     * Fetches the current value to check against when executing listeners. If
     * the listeners return value matches this one then it should be removed
     * automatically. It will return true by default.
     *
     * @return {*|Boolean} The current value to check for or the default, true.
     * @api private
     */
    proto._getOnceReturnValue = function _getOnceReturnValue() {
        if (this.hasOwnProperty('_onceReturnValue')) {
            return this._onceReturnValue;
        }
        else {
            return true;
        }
    };

    /**
     * Fetches the events object and creates one if required.
     *
     * @return {Object} The events storage object.
     * @api private
     */
    proto._getEvents = function _getEvents() {
        return this._events || (this._events = {});
    };

    /**
     * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
     *
     * @return {Function} Non conflicting EventEmitter class.
     */
    EventEmitter.noConflict = function noConflict() {
        exports.EventEmitter = originalGlobalValue;
        return EventEmitter;
    };

    return EventEmitter;

}.call({}));
},{}],36:[function(require,module,exports){
'use strict';

/*
 * ACTION
 * ====================================================================================
 * Creates a single function or a map of functions that when called with arguments will
 * emit a "trigger" event, passing the arguments
 * ====================================================================================
 */

var EventEmitter = require('./EventEmitter.js');
var error = require('./error.js');
var utils = require('./utils.js');

var createActionFunction = function (actionName) {

  // Create the action function
  var fn = function () {

    // Grab all the arguments and convert to array
    var args = utils.deepClone(Array.prototype.slice.call(arguments, 0));

    if (!fn._events) {
      return error.create({
        source: fn.handlerName,
        message: 'You are triggering an action that nobody listens to',
        support: 'Remember to add actions to your stores',
        url: 'https://github.com/christianalfoni/jflux/blob/master/DOCUMENTATION.md#jflux-store'
      });
    }
    // Merge arguments array with "trigger", which is the
    // event that will be triggered, passing the original arguments
    // as arguments to the "trigger" event
    args = ['trigger'].concat(args);
    fn.emit.apply(fn, args);

  };

  // It is possible to listen to the function and to achieve that we
  // have to manually inherit methods from EventEmitter
  for (var prop in EventEmitter.prototype) {
    if (EventEmitter.prototype.hasOwnProperty(prop)) {
      fn[prop] = EventEmitter.prototype[prop];
    }
  }

  // Add handlerName
  fn.handlerName = actionName;

  return fn;

};

var action = function () {

  if (Array.isArray(arguments[0])) {
    var actionMap = {};
    arguments[0].forEach(function (actionName) {
      actionMap[actionName] = createActionFunction(actionName);
    });
    return actionMap;
  }

  error.create({
    source: arguments[0],
    message: 'Could not create action(s)',
    support: 'Pass no arguments or an array of strings',
    url: 'https://github.com/christianalfoni/jflux/blob/master/DOCUMENTATION.md#jflux-action'
  });

};

module.exports = action;
},{"./EventEmitter.js":35,"./error.js":43,"./utils.js":50}],37:[function(require,module,exports){
'use strict';

/*
 * COMPONENT
 * ====================================================================================
 * Composable components that only updates diffs etc.
 * ====================================================================================
 */

 var dom = require('./dom.js');
 var utils = require('./utils.js');
 var Constructor = require('./component/Constructor.js');
 var error = require('./error.js');
 var convertAttributes = require('./component/convertAttributes.js');
 var h = require('virtual-dom/h');
 var diff = require('virtual-dom/diff');
 var patch = require('virtual-dom/patch');
 var createElement = require('virtual-dom/create-element');
 var dataStore = require('./dataStore.js');
 var config = require('./config.js');
 var exports = {};

 Constructor.prototype = {
  constructor: Constructor,

  // Runs when the component is added to the DOM by $$.render
  _init: function (target) {

    if (this.init) {
      this.init(target);
    }

    this._VTree = this._renderByMode();

    if (!this._VTree) {
      error.create({
        source: this._renders,
        message: 'Missing compiled DOM representation',
        support: 'You have to return a compile call from the render method'
      });
    }

    // Compile the renders, add bindings and listeners
    var el = createElement(this._VTree);

    // jflux-dust: Bootstrap component to existed element
    if (typeof target != 'undefined') {
      (function() {
        var $bootstrap_el, $rendr_el, rendr_VTree, exist_VTree;
        $bootstrap_el = dom.$(target);
        if (!$bootstrap_el.length) {
          error.create({
            source: this._renders,
            message: 'Bootstrap element with selector: ' + target + ' does not exist' + ((this.component && this.component.name) ? ' for component: ' + this.component.name : ''),
            support: 'You have to bootstrap component with existed element in your server rendered HTML'
          });
        }
        $rendr_el = dom.$(el);
        // $rendr_el.find('component').each(function(i, component) {
        //   dom.$(component).replaceWith(this._components.updateMap[component.id]._init().$el.attr('data-component', component.id));
        //   this._components.map[component.id] = this._components.updateMap[component.id];
        // }.bind(this));
        // return;
        rendr_VTree = this._buildVTree($rendr_el, this, this, 'bootstrap');
        exist_VTree = this._buildVTree($bootstrap_el, this, this, 'bootstrap');
        this.$el = dom.$(patch($bootstrap_el[0], diff(exist_VTree, rendr_VTree)));
      }).call(this);
    } else {
      this.$el = dom.$(el);
      // Put components into DOM tree and keep a reference to it in the map, for later
      // updates
      // this.$el.find('component').each(function(index, component) {
      //   dom.$(component).replaceWith(this._components.updateMap[component.id]._init().$el);
      //   this._components.map[component.id] = this._components.updateMap[component.id];
      // }.bind(this));
    }


    this._addBindings();
    this._addListeners();

    this.$el.on('destroy', this._remove.bind(this));

    if (this.afterRender) {
      this.afterRender();
    }

    if (this.animation && this.animation.in) {
      this._animation('in');
    } else {
        return this;
    }
  },

  _renderByMode: function () {

    var Dust = config().dust;
    var component = this;

    if (Dust) {
      this._registerDustComponentHelpers();
    }

    var args = Dust && this.template ? [] : [this._compiler.bind(this)];
    var render = this.render ? this.render.apply(this, args) : this.dust_render(this.template)(this);

    if (typeof render === 'string') {
      return this._buildVTree(render, this, this);
    } else {
      return render;
    }

  },

  dust_render: function(template) {
    var Dust = config().dust;
    return function templatesWrapper(data) {
      var result;
      Dust.render(template, data, function(err, data) {
        if (err) {
          throw err;
        }
        result = data;
      });
      return result;
    }
  },

  _registerDustComponentHelpers: function() {
    var Dust = config().dust;
    if (typeof Dust.helpers.Component == 'undefined') {
      Dust.helpers.Component = function(chunk, context, bodies, params) {
        var name = params.name,
            compname = context.get('component.name'),
            out = [];
        var components = context.get('components');
        if (typeof components[name] == 'undefined' || components[name].length == 0) {
          console.info('Dust templates subcomponent with name: "' + name + '" not found or empty' + (compname ? ' for component: ' + compname : '') + '. jFlux wont render it.');
          return;
        }
        var id = context.get('_currentNodeIndex');
        components[name].forEach(function(item) {
          Object.keys(params).forEach(function(param) {
            var cmap = context.get('_components.updateMap');
            Object.keys(cmap).forEach(function(idx) {
              if (cmap[idx].subname === name && param !== 'name') cmap[idx].props[param] = params[param];
            });
          });
          var $el = dom.$(createElement(item));
          out.push($el[0].outerHTML);
        });
        return chunk.write(out.join(''));
      };
    }
  },

  destroy: function() {
    this._remove();
    this._animation('out', function() {
      this.$el.remove();
    }.bind(this));
  },

  _animation: function(type, cb) {
    var el = this.$el;
    var $isFn = dom.$.isFunction;
    var an = this.animation;
    if (an && $isFn(an[type])) {
        an[type](el, function(){
          if ($isFn(cb)) cb();
      });
      return;
    } else if (an && dom.$.type(an[type]) === "string" && an[type].indexOf('animated') == 0) {
        el.addClass(an[type]).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
          el.removeClass(an[type]);
          if ($isFn(cb)) cb();
      });
      return;
      }
    if ($isFn(cb)) cb();
  },

  // Cleans up the listeners and removes the component from the DOM
  _remove: function () {
    if (this.beforeRemove) {
      this.beforeRemove();
    }
    this._listeners.forEach(function (listener) {
      listener.target.removeListener(listener.type, listener.cb);
    });
    dataStore.clear(this._dataStoreId);

    return this;

  },

  // Runs the "render" method which compiles a DOM representation
  _render: function () {

    // To detect calling "this.listenTo" etc. in the render method
    this._isRendering = true;
    this._renders = this.render(this._compiler.bind(this));
    this._isRendering = false;
  },

  // Adds bindings to inputs, so that properties and the component itself updates instantly
  _addBindings: function () {

    var component = this;
    Object.keys(this.bindings).forEach(function (binding) {

      var $el = binding ? component.$(binding) : component.$el;

      if ($el.is(':checkbox')) {

        $el.on('change', function () {
          var grabObject = utils.createGrabObject(component, component.bindings[binding]);
          grabObject.context[grabObject.prop] = $el.is(':checked');
          $el.trigger('$$-change');
          component.update();
        });

      } else {

        $el.on('keydown', function (event) {

          // Do not update on ENTER due to form submit
          if (event.keyCode !== 13) {

            // Use setTimeout to grab the value after keydown has run.
            // Gives the best experience
            setTimeout(function () {
              var grabObject = utils.createGrabObject(component, component.bindings[binding]);
              grabObject.context[grabObject.prop] = $el.val();
              $el.trigger('$$-change');
              component.update();
            }, 0);

          }

        });

      }

    });
  },

  // Adds interaction listeners, like "click" etc.
  _addListeners: function () {
    var component = this;
    Object.keys(this.events).forEach(function (listenerDefinition) {

      var listener = utils.extractTypeAndTarget(listenerDefinition);

      if (!component[component.events[listenerDefinition]]) {
        error.create({
          source: component[component.events[listenerDefinition]],
          message: 'There is no method called ' + component.events[listenerDefinition],
          support: 'Make sure that you add methods described in events on your component'
        })
      }

      if (listener.target) {
        component.$el.on(listener.type, listener.target, function (event) {

          var $target = dom.$(event.currentTarget);
          event.data = $target.data('data');
          component[component.events[listenerDefinition]](event);

        });
      } else {

      component.$el.on(listener.type, function (event, dd) {
      event.data = component.$el.data('data');
      component[component.events[listenerDefinition]](event, dd);

         });
      }

    });
  },

  _buildVTree: function (html, context, component, bootstrap) {

  var traverse = function (node) {

    // If top node is a component, return a component
    // if (node.nodeType === 8 && node.nodeValue.match(/Component\:.*/)) {
    // return h('component', {
    //   id: node.nodeValue.match(/Component\:(.*)/)[1]
    // }, []);
    // }

    // Props map
    var props = {};

    if (config().dust) {
      if (node.value) {
        props.value = node.value;
      }
      if (node.checked) {
        props.checked = node.checked;
      }
    }

    // Supplement with attributes on the node
    if (node.attributes) {
    props.attributes = {};
    for (var x = 0; x < node.attributes.length; x++) {
      var nodeName = node.attributes[x].nodeName;
      var nodeValue = node.attributes[x].nodeValue;
      props.attributes[nodeName] = nodeValue;
    }
    }

    if (typeof bootstrap == 'undefined') {
    convertAttributes(props, node, context, component);
    }

    // Create VTree node
    return h(node.tagName, props, 

    (function () {

      var children = [];
      for (var x = 0; x < node.childNodes.length; x++) {
      var childNode = node.childNodes[x];
      // Use a text node with special content that refers to a prop
      // on this component where the list is located
      if (childNode.nodeType === 8 && childNode.nodeValue === 'VTreeNodeList') {
        children = children.concat(component._VTreeLists.shift());
      } else if (childNode.nodeType === 3) {
        children.push(childNode.nodeValue);
      } else {
        var el = traverse(childNode);
        children.push(el);
      }
      }
      return children;

    }())
    )
  };

  if (typeof bootstrap == 'undefined') {
    var $node = dom.$(html);
  } else {
    var $node = html;
  }
  return traverse($node[0]);
  },

  _compiler: function () {

    var html = '';
    var context = this; // Either component or map context    
    var component = this._component || this;
    var args = Array.prototype.slice.call(arguments, 0);
    var traverseArgs = function (args) {
      args.forEach(function (arg) {
        if (context.subname && typeof arg != 'undefined') arg.subname = context.subname;
        var id = component._currentNodeIndex++;
        if (arg instanceof Constructor) {
          component._components.updateMap[id] = arg;
          // html += '<!--Component:'+ id + '-->';
           if (component._components.map[id])  {
              component._components.map[id].props = component._components.updateMap[id].props;
              component._components.map[id].update();
              html += component._components.map[id].$el[0].outerHTML;
           } else {
              html += component._components.updateMap[id]._init().$el[0].outerHTML;
              component._components.map[id] = component._components.updateMap[id];              
           }
        } else if (arg._childrenArray) {
          traverseArgs(arg);
        } else if (Array.isArray(arg)) {
          component._VTreeLists.push(arg);
          html += '<!--VTreeNodeList-->';
        } else {
          html += arg;
        }
      });
    };
    traverseArgs(args);
    return component._buildVTree(html, context, component);

  },
  $: function (query) {
    return this.$el.find(query);
  },

  update: function () {
    this._currentNodeIndex = 0;
    this._VTreeLists = [];
    this._components.updateMap = {};
    dataStore.clear(this._dataStoreId);

    var newVTree = this._renderByMode();
    if (typeof newVTree == 'undefined') return;
    // rebuild VTree from exist component element
    var existVTree = this._buildVTree(this.$el, this, this, 'bootstrap');
    var patches = diff(existVTree, newVTree);
    var html = patch(this.$el[0], patches);
    this._update();
  },

  _update: function() {
    var nestedComponents = this._components;

    // jflux-dust: ReRender Bootstrapped Subcomponents on first root component update
    // console.log('component.$el html', component.$el.html());
    // component.$el.find('[data-component]').each(function(i, el) {
    //   var $component = dom.$(el);
    //   var id = $component.data('component');
    //   $component.replaceWith(nestedComponents.map[id]._init().$el.removeAttr('data-component'));
    // });
    // jflux-dust

    // Remove any components that are not valid anymore
    Object.keys(nestedComponents.map).forEach(function (key) {
      
      if (!nestedComponents.updateMap[key]) {
        nestedComponents.map[key]._remove(); // Need to remove element?
        delete nestedComponents.map[key];
      } else {
      // if (nestedComponents.map[key].animation) {
      //     var fn = nestedComponents.map[key].animation;
      //     fn(nestedComponents.map[key].$el);
      // }
      }
    });

    this._animation('update');
  },

  listenToChange: function (target, cb) {
    this.listenTo(target, 'change', cb);
  },

  listenTo: function (target, type, cb) {

    if (this._isRendering) {
      error.create({
        source: null,
        message: 'You are running listenTo in your render',
        support: 'The listenTo method is to be run in the init method'
      });
    }

    cb = cb.bind(this);
    this._listeners.push({
      target: target,
      type: type,
      cb: cb
    });

    target.on(type, cb);

  },

  // Do a mapping and bind the item in the list to the context of the callback and compiler,
  // making it possible to use $$-attributes and this.someProp
  map: function (array, cb, subname) {
    var component = this;
    return array.map(function (item, index) {
      var context = {
        item: item,
        props: component.props,
        index: index,
        subname: subname,
        _component: component
      };
      return cb.call(context, component._compiler.bind(context));
    });
  }
};

module.exports = function (description) {
  return function () {
    var args = Array.prototype.slice.call(arguments, 0);
    var props = args.shift();
    var base = new Constructor(props, args);
    var component = utils.mergeTo(base, description);
    component._description = description;
    return component;
  }
};
},{"./component/Constructor.js":38,"./component/convertAttributes.js":39,"./config.js":40,"./dataStore.js":41,"./dom.js":42,"./error.js":43,"./utils.js":50,"virtual-dom/create-element":2,"virtual-dom/diff":3,"virtual-dom/h":4,"virtual-dom/patch":12}],38:[function(require,module,exports){
'use strict';

var dom = require('./../dom.js');
var dataStore = require('./../dataStore.js');

function Component (props, children) {

  // Used to keep track of components and data
  this._dataStoreId = dataStore.create();

  // Used by traditional compile to set an ID on nested components, but also by
  // templating to set ID using helpers
  this._currentNodeIndex = 0;
  this._VTree = null;
  this._VTreeLists = [];
  this._components = {
    map: {}, // Where we map the components that are actually in the DOM
    updateMap: {} // Where we put our components that are rendered on update an might move to map
  };
  this._isRendering = false;
  this._bindings = [];
  this._listeners = [];
  this._children = children;

  this.events = {};
  this.bindings = {};
  this.props = props || {};
  this.props.children = children || [];
  this.props.children._childrenArray = true;

  // Used by templating version to expose components to templates
  this.components = {};

}

module.exports = Component;
},{"./../dataStore.js":41,"./../dom.js":42}],39:[function(require,module,exports){
'use strict';

/*
 * CONVERTATTRIBUTES
 * ====================================================================================
 * Converts jFlux attributes to HTML attributes, and them removes the jFlux version.
 * The jFlux attribute is a property on a context. The value fetched is then use
 * to set the correct HTML attribute
 * ====================================================================================
 */
var dom = require('./../dom.js');
var utils = require('./../utils.js');
var dataStore = require('./../dataStore.js');

var converters = {
  '$$-id': function (node, value, props, context) {
    props['id'] = utils.grabContextValue(context, value);
    delete props.attributes['$$-id'];
  },
  '$$-class': function (node, value, props, context) {
    var attrValue = utils.grabContextValue(context, value);
    var classString = utils.createClassString(attrValue);
    if (classString) props['className'] = classString;
    delete props.attributes['$$-class'];
  },
  '$$-style': function (node, value, props, context) {
    props['style'] = utils.grabContextValue(context, value);
    delete props.attributes['$$-style'];
  },
  '$$-checked': function (node, value, props, context) {
    props['checked'] = utils.grabContextValue(context, value);
    delete props.attributes['$$-checked'];
  },
  '$$-disabled': function (node, value, props, context) {
    props['disabled'] = utils.grabContextValue(context, value);
    delete props.attributes['$$-disabled'];
  },
  '$$-value': function (node, value, props, context) {
    props['value'] = utils.grabContextValue(context, value);
    delete props.attributes['$$-value'];
  },
  '$$-href': function (name, value, props, context) {
    props['href'] = utils.grabContextValue(context, value);
    delete props.attributes['$$-href'];
  },
  '$$-show': function (node, value, props, context) {
    var show = utils.grabContextValue(context, value);
    props.style = props.style || {};
    if (show) {
      props.style.display = window.getComputedStyle(node, null).display;
    } else {
      props.style.display = 'none';
    }
    delete props.attributes['$$-show'];
  },
  '$$-hide': function (node, value, props, context) {
    var hide = utils.grabContextValue(context, value);
    props.style  = props.style || {};
    if (hide) {
      props.style.display = 'none';
    } else {
      props.style.display = window.getComputedStyle(node, null).display;
    }
    delete props.attributes['$$-hide'];
  },
  '$$-key': function (node, value, props, context) {
    props['key'] = utils.grabContextValue(context, value);
    delete props.attributes['$$-key'];
  },
  '$$-data': function (node, value, props, context, component) {
    dataStore.add(component._dataStoreId, component._currentNodeIndex, utils.grabContextValue(context, value));
    props.attributes['data-store'] = component._dataStoreId + '_' + component._currentNodeIndex;
    delete props.attributes['$$-data'];
  }
};

var convertAttributes = function (props, node, context, component) {

  Object.keys(node.attributes).forEach(function (attr) {
    var name = node.attributes[attr].nodeName;
    if (name && converters[name]) {
      var value = node.attributes[attr].nodeValue;
      converters[name](node, value, props, context, component);
    }
  });

};

module.exports = convertAttributes;
},{"./../dataStore.js":41,"./../dom.js":42,"./../utils.js":50}],40:[function(require,module,exports){
'use strict';

/*
 * CONFIG
 * ====================================================================================
 * Holds default config
 * ====================================================================================
 */
var utils = require('./utils.js');

var _options = {

    // jFlux will add application/json to request headers and parse
    // responses to JSON
    json: true,

    // If the application lives at /somePath, jFlux needs to know about it
    baseUrl: '',

    // Activates HTML5 pushState instead of HASH
    pushState: false,

    // Tells jFlux to run the $$.run method automatically, which routes to
    // current path
    autoRun: true,

    // SK Code Checked
    jquery: null,

    // SK Code Checked
    // Pass instance of DustJs to use DustJs templates
    dust: dust || window.dust || null

};

var config = function (options) {
    if (!options) {
        return _options;
    } else {
        utils.mergeTo(_options, options);
        if (options.jquery) { 
            var dom = require('./dom.js').setJquery(options.jquery);
        }
    }
};

module.exports = config;
},{"./dom.js":42,"./utils.js":50}],41:[function(require,module,exports){
'use strict';

var currentId = 0;
var stores = {};

module.exports = {
  create: function (data) {
    stores[++currentId] = {};    
    return currentId;
  },
  add: function (id, dataId, data) {    
    stores[id][dataId] = data;
  },
  clear: function (id) {
    stores[id] = {};
  },
  get: function (id, dataId) {
    return stores[id] ? stores[id][dataId] : null;  
  },
  all: function () {
    return stores;
  }
};
},{}],42:[function(require,module,exports){
(function (global){
'use strict';

var config = require('./config.js');

var dom = {
  $: function () {
    if (global.__app_jquery$) {
      this.$ = __app_jquery$;
      return this.$.apply(this.$, arguments);
    } 
    else if (this.$) {
      return this.$.apply(this.$, arguments);
    }
    else if (config().jquery) {
      this.$ = config().jquery;
      return this.$.apply(this.$, arguments);
    } else if (global.jQuery) {
      this.$ = global.jQuery;
      return this.$.apply(this.$, arguments);
    } else if (typeof window !== 'undefined') {
      this.$ = require('jquery');
      return this.$.apply(this.$, arguments);
    }
  },
  document: global.document,
  setJquery: function (jquery) {
    console.log('in setjquery');
    this.$ = jquery;
  },
  setWindow: function (window) {
    this.$ = require('jquery')(window);
    this.document = window.document;
  }
};

module.exports = dom;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./config.js":40,"jquery":"jquery"}],43:[function(require,module,exports){
'use strict';

module.exports = {
  create: function (options) {
    var errorString = 'jflux-dust error: ';
    var keys = Object.keys(options);
    if (keys.indexOf('source') >= 0) {
      errorString += (typeof options.source === 'object' && options.source !== null ? JSON.stringify(options.source) : options.source) + '. ';
    }
    if (keys.indexOf('message') >= 0) {
      errorString += options.message + '. ';
    }
    if (keys.indexOf('support') >= 0) {
      errorString += options.support + '. ';
    }
    throw new Error(errorString);
  }
};
},{}],44:[function(require,module,exports){
(function (global){
'use strict';

var config = require('./config.js');
var dom = require('./dom.js');
var render = require('./jflux/render.js');
var path = require('./jflux/path.js');
var component = require('./component.js');
var router = require('./router.js');
var run = require('./jflux/run.js');
var action = require('./action.js');
var store = require('./store.js');
// var test = require('./test.js');
var utils = require('./utils.js');
var dataStore = require('./dataStore.js');

var exports = {
    run: run,
    render: render,
    config: config,
    path: path,
    component: component,
    route: router.route,
    actions: action,
    store: store,
    // test: test,
    data: function (target) {
      
      if (!target) {
        return;
      }

      if (target.originalEvent) {
        target = target.target;
      }
      var attribute = dom.$(target).attr('data-store');
      return dataStore.get.apply(dataStore, attribute ? attribute.split('_') : null);
    
    },
    fakeStore: function (exports) {
      return this.store({
        exports: exports
      });
    }
};

// If not running in Node
if (typeof window !== 'undefined') {
  dom.$(function () {
    if (!global.define && config().autoRun) {
      exports.run();
    }
    if (config().json) {
      dom.$.ajaxSetup({
        contentType: 'application/json',
        dataType: 'json',
        processData: false,
        beforeSend: function (jXhr, options) {

          if (

            options.contentType === 'application/json' &&
          // If it is POST, PUT or DELETE.
          // GET converts data properties to a query
            options.type !== 'GET' &&

            // If you are passing data
            options.data &&

            // If it is not already a string
            typeof options.data !== 'string'
            ) {

            // Stringify the data to JSON
            options.data = JSON.stringify(options.data);
          }

        }
      });
    }
  });

}

// If running in global mode, expose $$
if (!global.exports && !global.module && (!global.define || !global.define.amd)) {
  // SK code, Need to add Expose to global option on config // to do
  // global.$$ = exports;
}

module.exports = exports;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./action.js":36,"./component.js":37,"./config.js":40,"./dataStore.js":41,"./dom.js":42,"./jflux/path.js":45,"./jflux/render.js":46,"./jflux/run.js":47,"./router.js":48,"./store.js":49,"./utils.js":50}],45:[function(require,module,exports){
'use strict';

/*
 * PATH
 * ====================================================================================
 * Returns the current route path
 * ====================================================================================
 */
var config = require('./../config.js');
var path = function () {

  return config().pushState ?

    // Return the pathname without baseUrl
    location.pathname.substr(config().baseUrl.length) :

    // Return the hash, without the #
    location.hash.substr(1);

};

module.exports = path;
},{"./../config.js":40}],46:[function(require,module,exports){
'use strict';

/*
 * RENDER
 * ====================================================================================
 * Initializes and appends a component to the DOM. It does a lookup to check if
 * there already is a component where it will either update by replacing the properties
 * or remove the old one and append the new one. If no components registered the
 * new component will be appended
 * ====================================================================================
 */

var dom = require('./../dom.js');
var utils = require('./../utils.js');

// Components rendered to the DOM will be stored in this array, as a lookup
var _renderedComponents = [];

// Add a special event that will run the handler when removed
// It is used to remove component when main element is removed from DOM
dom.$(function () {
  if (dom.$.event.special) {
    dom.$.event.special.destroy = {
      remove: function (data) {
        var component = data.handler();
        var existingRender = utils.getFromListByProp(_renderedComponents, 'component', component);
        if (existingRender) {
          _renderedComponents.splice(_renderedComponents.indexOf(existingRender), 1);
        }
      }
    };
  }
});

var render = function (component, target, type) {

  if (type === 'append') {
  _init(target, type);
  return;
  } 

  var existingRender = utils.getFromListByProp(_renderedComponents, 'target', target);

  // If there is an existing component of same type and the props has changed,
  // update existing component
  if (existingRender &&
    existingRender.component._description === component._description
      && !utils.deepCompare(existingRender.component.props, component.props)) {

    existingRender.component.props = component.props;
    existingRender.component.update();

    // If no existing component or the component type has changed,
    // initialize a new component

  // jflux-dust run local _init to render element with different types
  } else if (!existingRender || existingRender.component._description !== component._description) {
  _init(target, type || component.component && component.component.insert_type);
  }

  function _init(target, type) {

    if (type === 'bootstrap') {
      component._init(target);
    } else {
      component._init();
      if (type === 'append') {
        dom.$(target).first().append(component.$el);
      } else if (type === 'replace') {
        dom.$(target).replaceWith(component.$el);
      } else {
        dom.$(target).html(component.$el);
      }
    }

    _renderedComponents.push({
      component: component,
      target: target
    });
  }
};

module.exports = render;
},{"./../dom.js":42,"./../utils.js":50}],47:[function(require,module,exports){
'use strict';

/*
 * RUN
 * ====================================================================================
 * Registers hyperlink handling and triggers the router. This runs automatically
 * on page load, unless using requirejs or "autoRun" in the config is set to false
 * ====================================================================================
 */

var dom = require('./../dom.js');
var router = require('./../router.js');
var config = require('./../config.js');

var run = function () {

  // Any links triggered, intercept and use router instead, passing
  // the path
  dom.$('body').on('click', 'a', function (event) {

    // Only grab it if there is no target attribute
    if (!event.currentTarget.getAttribute('target') && !event.isDefaultPrevented()) {
      event.preventDefault();

      // We have to turn off the onhashchange trigger to avoid triggering the route
      // again, and at the same time allow for back/forward buttons
      var hashchange = window.onhashchange;
      window.onhashchange = null;

      // href is full url, so to get the path we need to remove the origin and any
      // baseUrl
      var path = event.currentTarget.href.substr(location.origin.length);
      router.goTo(path);

      // Put hash listening back into the event loop
      setTimeout(function () {
        window.onhashchange = hashchange;
      }, 0);
    }
  });

  if (config().pushState) {
    window.onpopstate = function () {
      router.goBack(location.pathname.substr(config().baseUrl.length));
    };
  } else {
    window.onhashchange = function () {
      if (location.hash) {
        router.goTo(location.hash.substr(1));
      } else {
        window.history.back(); // We are back from /# and want to continue once more
      }
    };
  }

  // Initial routing passing current pathname without baseUrl
  var path = location.pathname.substr(config().baseUrl.length);
  router.goTo(path);

};

module.exports = run;
},{"./../config.js":40,"./../dom.js":42,"./../router.js":48}],48:[function(require,module,exports){
'use strict';

/*
 * ROUTER
 * ====================================================================================
 * Registers new routes and handles route changes
 * ====================================================================================
 */

var dom = require('./dom.js');
var utils = require('./utils.js');
var config = require('./config.js');

var exports = {};

var routes = [];

var initialRouting = true;
var previousRoute = '';

exports.triggerRoute = function (route, compiledRoute, params, replaceState) {

  if (typeof route.callback === 'string') {

    exports.resolveRoute(utils.compileRoute(route.callback, params));

  } else if (config().pushState) {

    if (!initialRouting && previousRoute !== compiledRoute) {
      window.history[replaceState ? 'replaceState' : 'pushState']({}, '', config().baseUrl + compiledRoute);
    }
    initialRouting = false;
    route.callback(params);

  } else {
    location.href = config().baseUrl + '/#' + compiledRoute;
    route.callback(params);
  }
  previousRoute = compiledRoute;
};

exports.resolveRoute = function (path, replaceState) {
  for (var x = 0; x < routes.length; x++) {
    var route = routes[x];
    if (utils.matchRoute(path, route.path, utils.isParam)) {
      var params = utils.getParams(path, route.path, utils.isParam);
      return exports.triggerRoute(route, utils.compileRoute(route.path, params), params, replaceState);
    }
  }
  if (routes.length) {
    throw new Error('No routes match ' + path);
  }
};

exports.route = function (path, callback) {
  if (arguments.length === 1) {
    exports.goTo(path);
  } else {
    routes.push({
      path: path,
      callback: callback
    });
  }
};

exports.goTo = function (path) {
  dom.$(function () {
    exports.resolveRoute(path);
  });
};

exports.goBack = function (path) {
  exports.resolveRoute(path, true);
};

exports.deferTo = function (path) {
  return function () {
    exports.goTo(path);
  };
};

module.exports = exports;
},{"./config.js":40,"./dom.js":42,"./utils.js":50}],49:[function(require,module,exports){
'use strict';

var EventEmitter = require('./EventEmitter.js');
var utils = require('./utils.js');

function mergeStore (mixins, source) {

  source.actions = source.actions || [];
  source.exports = source.exports || {};

  if (mixins && Array.isArray(mixins)) {

    // Merge mixins and state
    mixins.forEach(function (mixin) {
      Object.keys(mixin).forEach(function (key) {

        switch(key) {
          case 'mixins':
            return mergeStore(mixin.mixins, mixin);
            break;
          case 'actions':
            source.actions = source.actions.concat(mixin.actions);
            break;
          case 'exports':
            Object.keys(mixin.exports).forEach(function (key) {
              source.exports[key] = mixin.exports[key];
            });
            break;
          default:
            if (source[key]) {
              throw new Error('The property: ' + key + ', already exists. Can not merge mixin with keys: ' + Object.keys(mixin).join(', '));
            }
            source[key] = mixin[key];
        }

      });
    });

  }

  var exports = Object.create(EventEmitter.prototype);
  var listeners = [];

  source.emitChange = function () {
    exports.emit('change');
  };

  source.emit = function () {
    exports.emit.apply(exports, arguments);
  };

  // Register actions
  source.actions.forEach(function (action) {
    if (!action || !action.handlerName) {
      throw new Error('This is not an action ' + action);
    }
    if (!source[action.handlerName]) {
      throw new Error('There is no handler for action: ' + action);
    }
    action.on('trigger', source[action.handlerName].bind(source));
  });

  // Register exports
  Object.keys(source.exports).forEach(function (key) {
    exports[key] = function () {
      return utils.deepClone(source.exports[key].apply(source, arguments));
    };
  });

  return exports;

};

module.exports = function (definition) {
  return mergeStore(definition.mixins, definition);
};;

},{"./EventEmitter.js":35,"./utils.js":50}],50:[function(require,module,exports){
'use strict';

var exports = {};
var convertAttributes = function (string, context) {
  string += '';
  var matches = string.match(/(?:\$\$-.*?="[^"]*")/g);
  if (matches) {
    matches.forEach(function (match) {
      var value = match.match(/"([^""]+)"/)[1];
      var newMatch = match.replace('"' + value + '"', '{' + JSON.stringify(context[value]) + '}');
      string = string.replace(match, '$' + newMatch)
    });
  }
  return string;
};

exports.convertArgsToString = function () {
 
  return html;
};

exports.deepClone = function (obj) {
  var copy, tmp, circularValue = '[Circular]', refs = [];

  // object is a false or empty value, or otherwise not an object
  if (!obj || "object" !== typeof obj || obj instanceof ArrayBuffer || obj instanceof Blob || obj instanceof File) return obj;

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array - or array-like items (Buffers)
  if (obj instanceof Array || typeof obj.length !== 'undefined') {
    
    refs.push(obj);
    copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      if (refs.indexOf(obj[i]) >= 0) {
        copy[i] = circularValue;
      } else {
        copy[i] = exports.deepClone(obj[i]);
      }
    }
    refs.pop();
    return copy;
  }

  // Handle Object
  refs.push(obj);
  copy = {};

  if (obj instanceof Error) {
    //raise inherited error properties for the clone
    copy.name = obj.name;
    copy.message = obj.message;
    copy.stack = obj.stack;
  }

  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) {
      if (refs.indexOf(obj[attr]) >= 0) {
        copy[attr] = circularValue;
      } else {
        copy[attr] = exports.deepClone(obj[attr]);
      }
    }
  }
  refs.pop();
  return copy;
};

exports.isParam = function (part) {
  var match = part.match(/^\{.*\}$/);
  return match && match.length ? true : false;
};

exports.removeFromListByProp = function (list, prop, item) {
  for (var x = 0; x < list.length; x++) {
    if (list[x][prop] === item) {
      list.splice(x, 1);
      return;
    }
  }
};

exports.flatten = function (array) {
  return array.reduce(function (returnArray, value) {
    returnArray = returnArray.concat(value);
    return returnArray;
  }, []);
};

exports.getFromListByProp = function (list, prop, item) {
  for (var x = 0; x < list.length; x++) {
    if (list[x][prop] === item) {
      return list[x];
    }
  }
};

exports.removeEmptyInArray = function (array) {
  for (var x = array.length - 1; x >= 0; x--) {
    if (!array[x] && typeof array[x] !== 'number') {
      array.splice(x, 1);
    }
  }
  return array;
};

exports.matchRoute = function (path, route, identifier) {
  if (route === '*') {
    return true;
  }
  var pathArray = path.split('/');
  var routeArray = route.split('/');
  this.removeEmptyInArray(pathArray);
  this.removeEmptyInArray(routeArray);
  if (pathArray.length !== routeArray.length) {
    return false;
  }
  for (var x = 0; x < pathArray.length; x++) {
    if (pathArray[x] !== routeArray[x] && !identifier(routeArray[x])) {
      return false;
    }
  }
  return true;
};

exports.getParams = function (path, route, identifier) {
  var params = {};
  var pathArray = path.split('/');
  var routeArray = route.split('/');
  routeArray.forEach(function (routePart, index) {
    if (identifier(routePart)) {
      params[routePart.replace(/\{|\}/g, '')] = pathArray[index];
    }
  });
  return params;
};

exports.compileRoute = function (path, params) {
  for (var prop in params) {
    if (params.hasOwnProperty(prop)) {
      path = path.replace('{' + prop + '}', params[prop]);
    }
  }
  return path;
};

exports.mergeTo = function (target) {
  var sources = Array.prototype.splice.call(arguments, 1, arguments.length - 1);
  sources.forEach(function (source) {
    for (var prop in source) {
      if (source.hasOwnProperty(prop)) {
        target[prop] = source[prop];
      }
    }
  });
  return target;
};

exports.isObject = function (obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
};

exports.deepCompare = function (a, b, except) {

  var compare = function (valueA, valueB) {
    if (Array.isArray(valueA) || exports.isObject(valueA)) {
      var isTheSame = exports.deepCompare(valueA, valueB);
      if (!isTheSame) {
        return false;
      }
    } else if (valueA !== valueB) {
      return false;
    }
    return true;
  };

  if (Array.isArray(a) && Array.isArray(b) && a !== b && a.length === b.length) {

    for (var x = 0; x < a.length; x++) {
      var isSame = compare(a[x], b[x]);
      if (!isSame) {
        return false;
      }
    }
    return true;

  } else if (exports.isObject(a) && exports.isObject(b) && a !== b) {

    // If number of properties has changed, it has changed, making them not alike
    if (Object.keys(a).length !== Object.keys(b).length) {
      return false;
    }


    for (var prop in a) {
      if (a.hasOwnProperty(prop)) {
        var isSame = compare(a[prop], b[prop]);
        if (!isSame) {
          return false;
        }
      }
    }

    return true;

  } else {
    return false;
  }
};

exports.grabContextValue = function (context, grabber) {
  var value = context;
  var grabs = grabber.split('.');
  grabs.forEach(function (grab) {
    value = value[grab];
  });
  return value;
};

exports.createGrabObject = function (context, grabString) {
  var grabs = grabString.split('.');
  var prop = grabs.pop();
  grabs.forEach(function (grab) {
    context = context[grab];
  });
  return {
    prop: prop,
    context: context
  }
};

exports.createClassString = function (obj) {
  var classes = [];
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop) && obj[prop]) {
      classes.push(prop);
    }
  }
  return classes.join(' ');
};

exports.extractTypeAndTarget = function (event) {
  var eventArray = event.split(' ');
  return {
    type: eventArray[0],
    target: eventArray[1]
  };
};

exports.convertStyleToMap = function (styleValue) {

  var styleMap = {};
  var styles = styleValue.split(';');
  styles.forEach(function (style) {
    if (!style) {
      return;
    }
    var styleValues = style.split(':');
    styleMap[styleValues[0]] = styleValues[1].trim();
  });
  return styleMap;

}

module.exports = exports;
},{}]},{},[44])(44)
});
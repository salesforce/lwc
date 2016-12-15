import StyleParser from './style-parser';
import { TOP_LEVEL_PROPS } from './constants';
import toCamelCase from 'to-camel-case';

const  parserCss = new StyleParser();

/* 
* Polyfill includes
* TODO: Remove when we support node > 6.x
*/
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/) {
    'use strict';
    if (this == null) {
      throw new TypeError('Array.prototype.includes called on null or undefined');
    }

    var O = Object(this);
    var len = parseInt(O.length, 10) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1], 10) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}

export function makeMap (str) {
    const map = Object.create(null);
    const list = str.split(',');

    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true;
    }
    return (val) => map[val];
}

export const isTopLevel = makeMap(TOP_LEVEL_PROPS.join(','));

export function parseStyles(styles) {
    return parserCss.parse(styles);
}

export function isCompatTag(tagName) {
    return !!tagName && /^[a-z]|\-/.test(tagName);
}

export { toCamelCase };


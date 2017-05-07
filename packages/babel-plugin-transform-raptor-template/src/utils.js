import StyleParser from './style-parser';
import { TOP_LEVEL_PROPS } from './constants';
import toCamelCase from 'camelcase';
import decamelize from 'decamelize';
const  parserCss = new StyleParser();

// Polyfill `includes`
// TODO: Remove when we support node > 6.x
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement: string /*, fromIndex*/) {
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

export function makeMap(str: string): any {
    const map = Object.create(null);
    const list = str.split(',');

    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true;
    }
    return (val) => map[val];
}

export const isTopLevelProp = makeMap(TOP_LEVEL_PROPS.join(','));

export function parseStyles(styles: string) {
    return parserCss.parse(styles);
}

export function isCompatTag(tagName: string) {
    return !!tagName && /^[a-z]|\-/.test(tagName);
}

export { toCamelCase };
export { decamelize };
// Parts of this code were levaraged from:
// t.react.cleanJSXElementLiteralChild() in babel-plugin-transform-template-jsx

export function cleanJSXElement(node: BabelNodeJSXText): any {
    const lines = node.value.split(/\r\n|\n|\r/);
    let lastNonEmptyLine = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/[^ \t]/)) {
            lastNonEmptyLine = i;
        }
    }

    let str = '';
    for (let _i = 0; _i < lines.length; _i++) {
        const line = lines[_i];
        const isFirstLine = _i === 0;
        const isLastLine = _i === lines.length - 1;
        const isLastNonEmptyLine = _i === lastNonEmptyLine;

        let trimmedLine = line.replace(/\t/g, ' ');

        if (!isFirstLine) {
            trimmedLine = trimmedLine.replace(/^[ ]+/, '');
        }

        if (!isLastLine) {
            trimmedLine = trimmedLine.replace(/[ ]+$/, '');
        }

        if (trimmedLine) {
            if (!isLastNonEmptyLine) {
                trimmedLine += ' ';
            }

            str += trimmedLine;
        }
    }

    return str;
}

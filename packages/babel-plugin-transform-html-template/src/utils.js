import StyleParser from './style-parser';
import { TOP_LEVEL_PROPS } from './constants';
import toCamelCase from 'to-camel-case';

const  parserCss = new StyleParser();

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


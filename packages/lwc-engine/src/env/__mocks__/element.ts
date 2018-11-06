jest.genMockFromModule('./../element');
jest.unmock('./../element');

const getBoundingClientRect = jest.fn().mockReturnValue({
    width: 100,
    height: 100,
}); // Hacking in layout for jsdom.

import {
    addEventListener,
    removeEventListener,
    hasAttribute,
    getAttribute,
    getAttributeNS,
    setAttribute,
    setAttributeNS,
    removeAttribute,
    removeAttributeNS,
    querySelector,
    querySelectorAll,
    getElementsByTagName,
    getElementsByClassName,
    getElementsByTagNameNS,
    tagNameGetter,
    tabIndexGetter,
    innerHTMLSetter,
    matches,
} from './../element'; // Pass through all the functions from element, we probably don't want those mocked

export {
    addEventListener,
    removeEventListener,
    hasAttribute,
    getAttribute,
    getAttributeNS,
    setAttribute,
    setAttributeNS,
    removeAttribute,
    removeAttributeNS,
    querySelector,
    querySelectorAll,
    getBoundingClientRect,
    getElementsByTagName,
    getElementsByClassName,
    getElementsByTagNameNS,
    tagNameGetter,
    tabIndexGetter,
    innerHTMLSetter,
    matches,
}

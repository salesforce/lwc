/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
jest.genMockFromModule('./../element');
jest.unmock('./../element');

const getBoundingClientRect = jest.fn().mockReturnValue({
    width: 100,
    height: 100,
}); // Hacking in layout for jsdom.

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
    getElementsByTagName,
    getElementsByClassName,
    getElementsByTagNameNS,
    tagNameGetter,
    tabIndexGetter,
    innerHTMLSetter,
    matches,
} from './../element'; // Pass through all the functions from element, we probably don't want those mocked

export { getBoundingClientRect };

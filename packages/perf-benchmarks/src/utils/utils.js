/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/** Assert presence of an HTMLElement matching a querySelector */
export function assertElement(selector) {
    const node = document.querySelector(selector);

    if (!node) {
        throw new Error(`Not element matching ${selector}`);
    }

    return node;
}

/** Assert present of text in a HTML Element */
export function assertText(selector, text) {
    const node = assertElement(selector);

    if (!node.text.includes(text)) {
        throw new Error(`No matching text ${text} for ${selector}`);
    }
}

/** Wait for the next rendering cycle to occur */
export function nextTick(cb) {
    return Promise.resolve().then(cb);
}

/** Wait for the next frame */
export function nextFrame(cb) {
    setTimeout(cb, 0);
}

export const insertComponent = function (el, container = document.body) {
    return new Promise((resolve) => {
        container.appendChild(el);
        nextFrame(() => {
            resolve(el);
        });
    });
};

export const destroyComponent = function (el) {
    return el && el.parentElement.removeChild(el);
};

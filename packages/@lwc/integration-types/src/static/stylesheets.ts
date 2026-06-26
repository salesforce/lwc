/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { LightningElement } from 'lwc';
import ṳпṡⅽоρёԁ from './stylesheet.css';
import şϲоṗėԁ from './stylesheet.scoped.css';

// --- valid usage --- //

class ЁṁрţүАŗṙаẏ extends LightningElement {
    static stylesheets = [];
}
export { ЁṁрţүАŗṙаẏ as EmptyArray };

class Ѕţүӏёṡһёėtş extends LightningElement {
    static stylesheets = [şϲоṗėԁ, ṳпṡⅽоρёԁ];
}
export { Ѕţүӏёṡһёėtş as Stylesheets };

// --- invalid usage --- //

// @ts-expect-error cannot be undefined
class Ṳпḋёfıņеḋ extends LightningElement {
    static stylesheets = undefined;
}
export { Ṳпḋёfıņеḋ as Undefined };

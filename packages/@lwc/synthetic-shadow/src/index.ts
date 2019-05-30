/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Collecting env references before patching anything
import './env/node';
import './env/element';
import './env/dom';
import './env/document';
import './env/window';
import './env/mutation-observer';

// Initialization Routines
import './polyfills/HTMLSlotElement/main';
import './polyfills/document-shadow/main';
import './polyfills/document-body-shadow/main';
import './polyfills/shadow-root/main';
import './polyfills/event-listener/main';
import './polyfills/click-event-composed/main'; // must come before event-composed
import './polyfills/event-composed/main';
import './polyfills/custom-event-composed/main';
import './polyfills/focus-event-composed/main';
import './polyfills/iframe-content-window/main';

// Internal Patches
import './faux-shadow/node';
import './faux-shadow/text';
import './faux-shadow/element';
import './faux-shadow/html-element';
import './faux-shadow/slot';
import './faux-shadow/event-target';
import './faux-shadow/portal';
import './faux-shadow/shadow-token';

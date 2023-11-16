/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Provides the global lwcRuntimeFlags variable
import '@lwc/features';

// Collecting env references before patching anything
import './env/node';
import './env/element';
import './env/slot';
import './env/dom';
import './env/document';
import './env/window';
import './env/mutation-observer';
import './env/shadow-root';

// Initialization Routines
import './polyfills/document-shadow/main';
import './polyfills/shadow-root/main';
import './polyfills/custom-event-composed/main';
import './polyfills/clipboard-event-composed/main';
import './polyfills/mutation-observer/main';
import './polyfills/event-target/main';
import './polyfills/event/main';
import './polyfills/focus-event/main';
import './polyfills/mouse-event/main';

// Internal Patches
import './faux-shadow/node';
import './faux-shadow/text';
import './faux-shadow/element';
import './faux-shadow/html-element';
import './faux-shadow/slot';
import './faux-shadow/portal';
import './faux-shadow/shadow-token';

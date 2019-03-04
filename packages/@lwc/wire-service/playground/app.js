/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// bootstrapping process for App
import { createElement, register } from 'lwc';
import { registerWireService } from 'wire-service';
import App from 'x/demo';

registerWireService(register);

const container = document.getElementById('main');
const element = createElement('x-demo', { is: App });
container.appendChild(element);

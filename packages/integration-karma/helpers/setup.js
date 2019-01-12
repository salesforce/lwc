/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Set the engine in test mode. This script need to be evaluated before the engine.
window.process = {
    env: {
        NODE_ENV: 'test'
    }
};

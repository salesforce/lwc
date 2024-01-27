/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LWCServer } from './server';

new LWCServer().startServer({
    // Port at which the web socket will communicating from
    port: 8080,
    protocol: 'ws',
    host: 'localhost',
    // Component paths to watch
    paths: [
        '/Users/ravi.jayaramappa/dev/raptor/lwc/packages/@lwc/integration-tests/src/components/',
    ],
});

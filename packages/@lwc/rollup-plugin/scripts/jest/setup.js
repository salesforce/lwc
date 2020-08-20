/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Increase timeout for all the rollup plugin tests. Depending on the environment, the default 5
// seconds might not be enough for the test to complete.
jest.setTimeout(20000);

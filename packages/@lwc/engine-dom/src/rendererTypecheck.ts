/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// The point of this file is to typecheck that `@lwc/renderer-abstract` has the same API
// shape as our renderer. It's unused, but just having the file forces TypeScript to typecheck.
import * as abstractRenderer from '@lwc/renderer-abstract';

import * as renderer from './renderer';

let typecheckedRenderer = renderer;
typecheckedRenderer = abstractRenderer;

// eslint-disable-next-line no-console
console.log(typecheckedRenderer); // use the variable so TypeScript doesn't complain

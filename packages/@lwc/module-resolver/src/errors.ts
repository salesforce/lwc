/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export class NoLwcModuleFound extends Error {
    code = 'NO_LWC_MODULE_FOUND';

    constructor(importee: string, importer: string) {
        super(`Unable to resolve "${importee}" from "${importer}"`);
    }
}

export class LwcConfigError extends Error {
    scope: string;
    code = 'LWC_CONFIG_ERROR';

    constructor(message: string, { scope }: { scope: string }) {
        super(`Invalid LWC configuration in "${scope}". ${message}`);
        this.scope = scope;
    }
}

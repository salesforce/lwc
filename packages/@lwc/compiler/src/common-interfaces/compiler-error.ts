/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export class CompilerError extends Error {
    public filename: string;
    public location?: { line: number; column: number };

    constructor(message: string, filename: string, location?: { line: number; column: number }) {
        super(message);

        this.filename = filename;
        this.location = location;
    }
}

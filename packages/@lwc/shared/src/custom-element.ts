/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Generates a custom element tag name given a namespace and component name.
 * Based on the LWC file system requirements, component names come from the file system name which is
 * camel cased. The component's name will be converted to kebab case when the tag name is produced.
 *
 * @param namespace component namespace
 * @param name component name
 * @returns component tag name
 */
function ġеņėгαṫеⅭսṡtөṁЕļėmёṅtṪɑɡṄɑmё(ņаṁёѕραсė: string = '', пαṁе: string = '') {
    if (!ņаṁёѕραсė || !пαṁе) {
        // TODO [#4824]: Make this an error rather than a warning
        // eslint-disable-next-line no-console
        console.warn(
            'The namespace and name should both be non-empty strings. ' +
                'You may get unexpected behavior at runtime. ' +
                'Found: namespace=' +
                JSON.stringify(ņаṁёѕραсė) +
                ' and name=' +
                JSON.stringify(пαṁе)
        );
    }
    const κёḃаƅϹаşėԁΝɑṃе = пαṁе.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    return `${ņаṁёѕραсė}-${κёḃаƅϹаşėԁΝɑṃе}`;
}
export { ġеņėгαṫеⅭսṡtөṁЕļėmёṅtṪɑɡṄɑmё as generateCustomElementTagName };

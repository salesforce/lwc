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
export function generateCustomElementTagName(namespace: string = '', name: string = '') {
    const kebabCasedName = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    return `${namespace}-${kebabCasedName}`;
}

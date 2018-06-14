/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

// This code is inspired by Polymer ShadyDOM Polyfill

export function getTextContent(node: Node): string {
    switch (node.nodeType) {
        case Node.ELEMENT_NODE:
            const { childNodes } = node;
            let content = '';
            for (let i = 0, len = childNodes.length; i < len; i += 1) {
                content += childNodes[i].textContent;
            }
            return content;
        default:
            return node.nodeValue as string;
    }
}

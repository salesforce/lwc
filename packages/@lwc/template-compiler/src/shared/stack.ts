/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

interface Node<T> {
    previous: Node<T> | null;
    data: T;
}

export default class Stack<T> {
    private topNode: Node<T> | null = null;

    private getTopNode(): Node<T> {
        if (!this.topNode) {
            throw new Error('Stack is empty');
        }

        return this.topNode;
    }

    push(value: T): void {
        this.topNode = {
            previous: this.topNode,
            data: value,
        };
    }

    pop(): T {
        const { data, previous } = this.getTopNode();

        this.topNode = previous;
        return data;
    }

    peek(): T {
        return this.getTopNode().data;
    }
}

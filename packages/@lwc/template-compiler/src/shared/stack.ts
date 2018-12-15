/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
class Node<T> {
    public previous: Node<T>;
    public data: T;

    constructor(data: T, previous: Node<T>) {
        this.previous = previous;
        this.data = data;
    }
}

// tslint:disable-next-line:max-classes-per-file
export default class Stack<TData> {
    private topNode: Node<TData>;

    public push(value: TData): void {
        // create a new Node and add it to the top
        const node = new Node<TData>(value, this.topNode);
        this.topNode = node;
    }

    public pop(): TData {
        // remove the top node from the stack.
        // the node at the top now is the one before it
        const poppedNode = this.topNode;
        this.topNode = poppedNode.previous;
        return poppedNode.data;
    }

    public peek(): TData {
        return this.topNode.data;
    }
}

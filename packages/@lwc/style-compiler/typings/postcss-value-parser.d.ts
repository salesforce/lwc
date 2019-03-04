/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
declare module 'postcss-value-parser' {
    export interface BaseNode {
        type: string;
        value: string;
        sourceIndex?: number;
    }

    export interface Word extends BaseNode {
        type: 'word';
    }

    export interface String extends BaseNode {
        type: 'string';
        quote: "'" | '"';
        unclosed: boolean;
    }

    export interface Div extends BaseNode {
        type: 'div';
        before: boolean;
        after: boolean;
    }

    export interface Space extends BaseNode {
        type: 'space';
    }

    export interface Comment extends BaseNode {
        type: 'comment';
        unclosed: boolean;
    }

    export interface Function extends BaseNode {
        type: 'function';
        before: string;
        after: string;
        nodes: Node[];
        unclosed: boolean;
    }

    export type Node = Word | String | Div | Space | Comment | Function;

    interface ValueParsed {
        nodes: Node[];
        toString(): string;
        walk(callback: WalkCallback, bubble?: boolean): ValueParsed;
    }

    export function unit(quantity: string): { number: string; unit: string } | false;

    export type CustomStringifier = (node: Node) => string;

    export function stringify(nodes: Node | Node[], custom?: CustomStringifier): string;

    export type WalkCallback = (node: Node, index: number, nodes: Node[]) => any;

    export function walk(nodes: Node[], callback: WalkCallback, bubble?: boolean): ValueParsed;

    export default function(value: string): ValueParsed;
}

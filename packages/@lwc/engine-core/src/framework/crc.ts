import crc32 from 'crc/calculators/crc32';
import {
    VNode,
    VNodes,
    VNodeType,
    VText,
    // VComment,
    VElement,
    VCustomElement,
    // VStatic,
    // VFragment,
    // VScopedSlotFragment,
} from './vnodes';
import { VM } from './vm';

type Check = (str?: string) => any;

const te = new TextEncoder();
const encode = te.encode.bind(te);

function visitElement(vel: VElement | VCustomElement, check: Check): void {
    check(vel.sel);
    if (vel.data.attrs) {
        Object.entries(vel.data.attrs).forEach(([key, val]) => {
            check(key);
            check(val?.toString());
        });
    }
    check(vel.data.className);
    check(vel.data.style);
    for (const child of vel.children) {
        visitVNode(child, check);
    }
}

function visitVNode(vnode: VNode | null, check: Check): void {
    if (!vnode) {
        return;
    }
    switch (vnode.type) {
        case VNodeType.Text:
        case VNodeType.Comment:
        case VNodeType.Static:
        case VNodeType.Fragment:
        case VNodeType.ScopedSlotFragment:
            return;

        case VNodeType.Element:
        case VNodeType.CustomElement:
            return visitElement(vnode, check);
    }
}

function flatten(toFlatten: Uint8Array[], length: number): Uint8Array {
    const flattened: Uint8Array = new Uint8Array(length);
    let offset = 0;
    for (const segment of toFlatten) {
        flattened.set(segment, offset);
        offset += segment.length;
    }
    return flattened;
}

const EMPTY = new Uint8Array([0]);
export function generateCRC(vnodes: VNodes): string {
    const toVerify: Uint8Array[] = [];
    let length = 0;
    const check = (str?: string) => {
        if (!str) {
            toVerify.push(EMPTY);
            length += 1;
            return;
        }
        const uint8arr = encode(str);
        length += uint8arr.length;
        toVerify.push(encode(str));
    };
    for (const vnode of vnodes) {
        visitVNode(vnode, check);
    }
    return crc32(flatten(toVerify, length)).toString(16);
}

export function attachCRC(orig: VNodes, vm: VM): VNodes {
    const crc = generateCRC(orig);
    const scriptContent: VText = {
        type: VNodeType.Text,
        sel: undefined,
        text: crc,
        key: undefined,
        elm: undefined,
        owner: vm,
    };
    const scriptTag: VElement = {
        type: VNodeType.Element,
        sel: 'script',
        elm: undefined,
        data: {
            key: 'crc',
            className: 'lwc-ssr-crc',
            attrs: {
                type: 'text/plain',
            },
        },
        children: [scriptContent],
        owner: vm,
        key: 'crc',
    };
    return [...orig, scriptTag];
}

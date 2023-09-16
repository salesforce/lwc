import crc32 from 'crc/calculators/crc32';
import { VElement, VNode, VNodes, VNodeType, VText } from './vnodes';
import { VM } from './vm';

const EMPTY = new Uint8Array([0]);
enum PositionCheck {
    Text = 1,
    Comment = 2,
    Static = 3,
    Fragment = 4,
    ScopedSlotFragment = 5,
    CustomElement = 6,
}
const PositionCheckEncodings = new Map(
    Object.keys(PositionCheck)
        .filter((key) => /\d+/.test(key))
        .map((key) => {
            const keyInt = Number.parseInt(key);
            return [keyInt, new Uint8Array(keyInt)];
        })
);

type Check = ((str?: string) => void) & {
    position: (kind: PositionCheck) => void;
};

const te = new TextEncoder();
const encode = te.encode.bind(te);

function visitElement(vel: VElement, check: Check): void {
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
        // The contents of these nodes are unimportant. However, we do care
        // about the kind, number, and position of these nodes, so we account
        // for that.
        case VNodeType.Text:
            // Text content is patched during hydration, and does not cause
            // hydration validation failures.
            return check.position(PositionCheck.Text);
        case VNodeType.Comment:
            return check.position(PositionCheck.Comment);
        case VNodeType.Static:
            return check.position(PositionCheck.Static);
        case VNodeType.Fragment:
            return check.position(PositionCheck.Fragment);
        case VNodeType.ScopedSlotFragment:
            return check.position(PositionCheck.ScopedSlotFragment);
        case VNodeType.CustomElement:
            // We rely on hydration of each custom element to validate itself.
            // If a parent component passes incorrect props to a custom child
            // element, its own validation (or maybe its child) will fail.
            // Because of that, we don't need to police correctness of
            // non-primitive values passed as props here.
            return check.position(PositionCheck.CustomElement);

        // Attributes of <div>s and <span>s matter, and differences between
        // CSR and SSR attribute values should cause validation to fail.
        case VNodeType.Element:
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
    check.position = (num: PositionCheck) => {
        toVerify.push(PositionCheckEncodings.get(num)!);
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

import { VM } from "./vm";
import { VNode } from "../3rdparty/snabbdom/types";
import { StringSplit } from "./language";

import { DOCUMENT_POSITION_CONTAINS, compareDocumentPosition } from "./dom/node";

const assert = {
    invariant(value: any, msg: string) {
        if (!value) {
            throw new Error(`Invariant Violation: ${msg}`);
        }
    },
    isTrue(value: any, msg: string) {
        if (!value) {
            throw new Error(`Assert Violation: ${msg}`);
        }
    },
    isFalse(value: any, msg: string) {
        if (value) {
            throw new Error(`Assert Violation: ${msg}`);
        }
    },
    vnode(vnode: VNode) {
        assert.isTrue(vnode && "sel" in vnode && "data" in vnode && "children" in vnode && "text" in vnode && "elm" in vnode && "key" in vnode && "nt" in vnode, `${vnode} is not a vnode.`);
    },
    vm(vm: VM) {
        assert.isTrue(vm && "component" in vm, `${vm} is not a vm.`);
    },
    fail(msg: string) {
        throw new Error(msg);
    },
    logError(msg: string) {
        try {
            throw new Error(msg);
        } catch (e) {
            console.error(e); // tslint:disable-line
        }
    },
    logWarning(msg: string) {
        try {
            throw new Error(msg);
        } catch (e) {
            const stackTraceLines: string[] = StringSplit.call(e.stack, '\n');
            console.group(`Warning: ${msg}`); // tslint:disable-line
            stackTraceLines.filter((trace) => {
                 // Chrome adds the error message as the first item in the stack trace
                 // So we filter it out to prevent logging it twice.
                return trace.replace('Error: ', '') !== msg;
            })
            .forEach((trace) => {
                // We need to format this as a string,
                // because Safari will detect that the string
                // is a stack trace line item and will format it as so
                console.log('%s', trace.trim()); // tslint:disable-line
            });
            console.groupEnd(); // tslint:disable-line
        }
    },
    childNode(container: Node, node: Node, msg: string) {
        assert.isTrue(compareDocumentPosition.call(node, container) & DOCUMENT_POSITION_CONTAINS, msg || `${node} must be a child node of ${container}`);
    }
};

export default assert;

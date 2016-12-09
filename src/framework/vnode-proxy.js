import assert from "./assert.js";

const VNodeProxy = {
    get(vnode: VNode, propName: string): any {
        assert.vnode(vnode);
        const { elm } = vnode;
        return elm[propName];
    },
    set(vnode: VNode, propName: string, newValue: any): boolean {
        assert.vnode(vnode);
        const { elm } = vnode;
        elm[propName] = newValue;
        return true;
    },
    defineProperty(vnode: VNode, propName: string, descriptor: PropertyDescriptor): boolean {
        assert.vnode(vnode);
        assert.fail(`Property name ${propName} cannot be defined as ${descriptor} for component ${vnode}.`);
        return false;
    },
    deleteProperty(vnode: VNode, propName: string): boolean {
        assert.vnode(vnode);
        assert.fail(`Property name ${propName} cannot be deleted for component ${vnode}.`);
        return false;
    },
    has(vnode: VNode, propName: string): boolean {
        assert.vnode(vnode);
        const { elm } = vnode;
        return elm.hasOwnProperty(propName);
    },
    ownKeys(vnode: VNode): Array {
        assert.vnode(vnode);
        const { elm } = vnode;
        return Object.getOwnPropertyNames(elm);
    },
    getOwnPropertyDescriptor(vnode: VNode, propName: string): PropertyDescriptor {
        assert.vnode(vnode);
        const { elm } = vnode;
        const descriptor = elm.getOwnPropertyDescriptor(propName);
        if (descriptor) {
            return {
                value: elm[propName],
                writable: descriptor.writable,
                enumerable: descriptor.enumerable,
                configurable: false
            };
        }
        return undefined;
    },
    isExtensible(vnode: VNode): boolean {
        assert.vnode(vnode);
        return false;
    },
    getPrototypeOf(vnode: VNode) {
        assert.vnode(vnode);
    },
    setPrototypeOf(vnode: VNode, prototype: any): boolean {
        assert.vnode(vnode);
        assert.fail(`The prototype of ${vnode} cannot be changed to ${prototype}.`);
        return false;
    },
};

export default VNodeProxy;

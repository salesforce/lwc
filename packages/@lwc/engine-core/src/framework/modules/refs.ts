import { isUndefined } from '@lwc/shared';
import { RefVNodes, VM } from '../vm';
import { VBaseElement, VStaticPart } from '../vnodes';

// Set a ref (lwc:ref) on a VM, from a template API
export function applyRefs(vnode: VBaseElement | VStaticPart, owner: VM) {
    const { data } = vnode;
    const { ref } = data;

    if (isUndefined(ref)) {
        return;
    }

    if (process.env.NODE_ENV !== 'production' && isUndefined(owner.refVNodes)) {
        throw new Error('refVNodes must be defined when setting a ref');
    }

    // If this method is called, then vm.refVNodes is set as the template has refs.
    // If not, then something went wrong and we threw an error above.
    const refVNodes: RefVNodes = owner.refVNodes!;

    // In cases of conflict (two elements with the same ref), prefer the last one,
    // in depth-first traversal order. This happens automatically due to how we render
    refVNodes[ref] = vnode;
}

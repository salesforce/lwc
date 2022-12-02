import { create, defineProperty } from '@lwc/shared';
import { defaultEmptyTemplate } from '../secure-template';
import { registerComponent } from '../component';
import { LightningElement, LightningElementConstructor } from '../base-lightning-element';
import { ComponentDef, getComponentInternalDef } from '../def';
import {
    appendVM,
    computeShadowMode,
    createVMContext,
    getAssociatedVMIfPresent,
    hasWireAdapters,
    resetComponentRoot,
    runConnectedCallback,
    runDisconnectedCallback,
    VM,
    VMState,
} from '../vm';
import { invokeComponentConstructor } from '../invoker';
import { installWireAdapters } from '../wiring';

function replaceDefinitionForVM(vm: VM, newDef: ComponentDef, replacedCallback: () => void) {
    if (vm.state === VMState.connected) {
        runDisconnectedCallback(vm);
    }
    if (vm.state === VMState.disconnected) {
        // there is a possibility that the elm is disconnected, and the content
        // inside its shadow is still visible to the new component, since the
        // element is reused and runDisconnectedCallback doesn't remove its
        // content, we need to do it manually.
        resetComponentRoot(vm);
    }
    // remove content of the shadow if any and any internal cache
    vm.def = newDef;
    vm.context = createVMContext();
    vm.cmpProps = create(null);
    vm.cmpFields = create(null);
    vm.refVNodes = null;

    // validation of the mode... it must match the mode of the original implementation
    // users can extend DynamicLightingElement to adjust the mode at will.
    // do we need the same thing for cm.renderMode? I believe we do!
    if (vm.shadowMode !== computeShadowMode(vm)) {
        throw new TypeError(`Incompatible ShadowMode`);
    }
    // Create a new component instance associated to the vm and the element.
    invokeComponentConstructor(vm, newDef.ctor);
    // Initializing the wire decorator per instance only when really needed
    if (hasWireAdapters(vm)) {
        installWireAdapters(vm);
    }

    // what about existing props? should that be carry on by the diffing algo?
    replacedCallback();

    if (vm.elm.isConnected) {
        // virtual re-insertion of the component into the DOM, by faking it.
        runConnectedCallback(vm);
        appendVM(vm);
    }
}

function getVMFromComponent(obj: any): VM {
    const vm = getAssociatedVMIfPresent(obj);
    if (!vm) {
        throw TypeError(`Invalid Invocation`);
    }
    return vm;
}

export class DynamicLightingElement extends LightningElement {
    constructor() {
        super();
        let ctor: LightningElementConstructor | null = null;
        const { replacedCallback } = this;
        // installing the elm.ctor public property, it is not reflective to an attribute,
        // and it is not configurable to avoid something messing with its public API. The
        // fact that it is installed on instance guarantees that changing the proto-chain
        // will not affect its behavior.
        defineProperty(getVMFromComponent(this).elm, 'ctor', {
            get(): LightningElementConstructor | null {
                getVMFromComponent(this); // validation only
                return ctor;
            },
            set(newCtor: LightningElementConstructor) {
                const def = getComponentInternalDef(newCtor);
                if (ctor === newCtor) {
                    return;
                }
                const vm = getVMFromComponent(this); // additionally validation
                ctor = newCtor;
                // kick in the replacement
                replaceDefinitionForVM(vm.elm, def, () => replacedCallback.apply(this));
            },
            configurable: false,
        });
    }
    replacedCallback(): void {
        // this is useful for subclasses to get a notification every time the
        // component is swapped after setting `ctor` property.
    }
}

registerComponent(DynamicLightingElement, { tmpl: defaultEmptyTemplate });

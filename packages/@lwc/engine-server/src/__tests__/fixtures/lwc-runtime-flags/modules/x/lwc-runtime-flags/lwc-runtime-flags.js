import { LightningElement, wire } from 'lwc';
import { getRuntimeFlags } from './wire';

export default class LwcRuntimeFlags extends LightningElement {
    static renderMode = 'light';
    dynamicProperty = 'dynamic';
    lwcRuntimeFlagsConnected;
    lwcRuntimeFlagsWiredConnected;
    lwcRuntimeFlagsWiredRendered;

    configWiredConnected;

    configWiredRendered = '';

    @wire(getRuntimeFlags, {
        dynamic: '$dynamicProperty',
        static: 'static',
    })
    wiredLwcRuntimeFlags;

    get isHydrated() {
        return this.configWiredRendered.includes('"dynamic":"dynamic"');
    }

    connectedCallback() {
        this.lwcRuntimeFlagsConnected = JSON.stringify(Reflect.get(globalThis, 'lwcRuntimeFlags'));
        this.lwcRuntimeFlagsWiredConnected = JSON.stringify(this.wiredLwcRuntimeFlags?.flags);
        this.configWiredConnected = JSON.stringify(this.wiredLwcRuntimeFlags?.config);
    }

    renderedCallback() {
        this.lwcRuntimeFlagsWiredRendered = JSON.stringify(this.wiredLwcRuntimeFlags?.flags);
        this.configWiredRendered = JSON.stringify(this.wiredLwcRuntimeFlags?.config);
    }
}

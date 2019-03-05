import { LightningElement, track } from 'lwc';

export default class ReactiveProp extends LightningElement {
    @track trackHasOwnProp = {};
    @track trackDefineProp = {};
    @track trackDeletedProp = { inner: true };
    @track trackEnumerableProp = { visible: true };

    constructor() {
        super();
    }

    get hasOwnProp() {
        return this.trackHasOwnProp.hasOwnProperty('inner');
    }

    handleTrackHasOwnProp() {
        this.trackHasOwnProp.inner = true;
    }

    get hasDefinedProp() {
        return this.trackDefineProp.inner;
    }

    handleTrackDefinePropClick() {
        Object.defineProperty(this.trackDefineProp, 'inner', {
            value: 'true',
            enumerable: true,
        });
    }

    get hasDeletedProp() {
        return 'inner' in this.trackDeletedProp;
    }

    handleTrackDeletePropClick() {
        delete this.trackDeletedProp['inner'];
    }

    get hasEnumerable() {
        return Object.keys(this.trackEnumerableProp);
    }

    handleTrackEnumerableClick() {
        Object.defineProperty(this.trackEnumerableProp, 'visible', {
            enumerable: false,
        });
    }
}

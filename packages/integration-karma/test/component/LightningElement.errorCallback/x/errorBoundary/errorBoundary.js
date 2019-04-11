import { LightningElement, track, api } from 'lwc';

export default class RootParent extends LightningElement {
    @track state = {
        'boundary-child-constructor-throw': false,
        'boundary-child-render-throw': false,
        'boundary-child-rendered-throw': false,
        'boundary-child-connected-throw': false,
        'boundary-child-attr-changed-throw': false,
        'boundary-child-slot-throw': false,
        'boundary-child-self-rehydrate-throw': false,
        'boundary-alternative-view-throw': false,
    };

    @api
    toggleFlag(flag) {
        this.state[flag] = true;
    }

    get getBoundaryChildConstructorThrow() {
        return this.state['boundary-child-constructor-throw'];
    }

    get getBoundaryChildRenderThrow() {
        return this.state['boundary-child-render-throw'];
    }

    get getBoundaryChildRenderedThrow() {
        return this.state['boundary-child-rendered-throw'];
    }

    get getBoundaryChildConnectedThrow() {
        return this.state['boundary-child-connected-throw'];
    }

    get getBoundaryChildAttrChangedThrow() {
        return this.state['boundary-child-attr-changed-throw'];
    }

    get getBoundaryChildSlotThrow() {
        return this.state['boundary-child-slot-throw'];
    }

    get getBoundaryChildSelfRehydrateThrow() {
        return this.state['boundary-child-self-rehydrate-throw'];
    }

    get getBoundaryAltViewThrow() {
        return this.state['boundary-alternative-view-throw'];
    }

    get getNestedBoundaryChildAltViewThrow() {
        return this.state['nested-boundary-child-alt-view-throw'];
    }
}

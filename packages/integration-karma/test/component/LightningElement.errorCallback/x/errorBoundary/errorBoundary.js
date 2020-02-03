import { LightningElement, track, api } from 'lwc';

export default class RootParent extends LightningElement {
    @track state = {
        boundaryChildConstructorThrow: false,
        boundaryChildRenderThrow: false,
        boundaryChildRenderedThrow: false,
        boundaryChildConnectedThrow: false,
        boundaryChildAttrChangedThrow: false,
        boundaryChildSlotThrow: false,
        boundaryChildThrow: false,
        boundaryChildSelfRehydrateThrow: false,
        boundaryAlternativeViewThrow: false,
        nestedBoundaryChildAltViewThrow: false,
    };

    @api
    toggleFlag(flag) {
        this.state[flag] = true;
    }
}

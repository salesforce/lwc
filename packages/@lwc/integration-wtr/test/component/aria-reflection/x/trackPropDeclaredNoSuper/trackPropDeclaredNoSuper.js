import { LightningElement, api, track } from 'lwc';
import template from '../shared/template.html';

export default class extends LightningElement {
    // base props

    @api
    renderCount = 0;

    renderedCallback() {
        this.renderCount++;
    }

    render() {
        return template;
    }

    @api
    getPropInternal(propName) {
        return this[propName];
    }

    @api
    getAttrInternal(attrName) {
        return this.getAttribute(attrName);
    }

    @api
    setPropInternal(propName, value) {
        this[propName] = value;
    }

    // our props

    @track ariaAutoComplete = null;
    @track ariaChecked = null;
    @track ariaCurrent = null;
    @track ariaDisabled = null;
    @track ariaExpanded = null;
    @track ariaHasPopup = null;
    @track ariaHidden = null;
    @track ariaInvalid = null;
    @track ariaLabel = null;
    @track ariaLevel = null;
    @track ariaMultiLine = null;
    @track ariaMultiSelectable = null;
    @track ariaOrientation = null;
    @track ariaPressed = null;
    @track ariaReadOnly = null;
    @track ariaRequired = null;
    @track ariaSelected = null;
    @track ariaSort = null;
    @track ariaValueMax = null;
    @track ariaValueMin = null;
    @track ariaValueNow = null;
    @track ariaValueText = null;
    @track ariaLive = null;
    @track ariaRelevant = null;
    @track ariaAtomic = null;
    @track ariaBusy = null;
    @track ariaActiveDescendant = null;
    @track ariaControls = null;
    @track ariaDescribedBy = null;
    @track ariaFlowTo = null;
    @track ariaLabelledBy = null;
    @track ariaOwns = null;
    @track ariaPosInSet = null;
    @track ariaSetSize = null;
    @track ariaColCount = null;
    @track ariaColSpan = null;
    @track ariaColIndex = null;
    @track ariaColIndexText = null;
    @track ariaDescription = null;
    @track ariaDetails = null;
    @track ariaErrorMessage = null;
    @track ariaKeyShortcuts = null;
    @track ariaModal = null;
    @track ariaPlaceholder = null;
    @track ariaRoleDescription = null;
    @track ariaRowCount = null;
    @track ariaRowIndex = null;
    @track ariaRowIndexText = null;
    @track ariaRowSpan = null;
    @track ariaBrailleLabel = null;
    @track ariaBrailleRoleDescription = null;
    @track role = null;
}

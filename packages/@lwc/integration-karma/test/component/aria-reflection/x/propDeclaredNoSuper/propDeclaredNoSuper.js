import { LightningElement, api } from 'lwc';
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

    ariaAutoComplete = null;
    ariaChecked = null;
    ariaCurrent = null;
    ariaDisabled = null;
    ariaExpanded = null;
    ariaHasPopup = null;
    ariaHidden = null;
    ariaInvalid = null;
    ariaLabel = null;
    ariaLevel = null;
    ariaMultiLine = null;
    ariaMultiSelectable = null;
    ariaOrientation = null;
    ariaPressed = null;
    ariaReadOnly = null;
    ariaRequired = null;
    ariaSelected = null;
    ariaSort = null;
    ariaValueMax = null;
    ariaValueMin = null;
    ariaValueNow = null;
    ariaValueText = null;
    ariaLive = null;
    ariaRelevant = null;
    ariaAtomic = null;
    ariaBusy = null;
    ariaActiveDescendant = null;
    ariaControls = null;
    ariaDescribedBy = null;
    ariaFlowTo = null;
    ariaLabelledBy = null;
    ariaOwns = null;
    ariaPosInSet = null;
    ariaSetSize = null;
    ariaColCount = null;
    ariaColSpan = null;
    ariaColIndex = null;
    ariaColIndexText = null;
    ariaDescription = null;
    ariaDetails = null;
    ariaErrorMessage = null;
    ariaKeyShortcuts = null;
    ariaModal = null;
    ariaPlaceholder = null;
    ariaRoleDescription = null;
    ariaRowCount = null;
    ariaRowIndex = null;
    ariaRowIndexText = null;
    ariaRowSpan = null;
    ariaBrailleLabel = null;
    ariaBrailleRoleDescription = null;
    role = null;
}

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

    @api ariaAutoComplete = null;
    @api ariaChecked = null;
    @api ariaCurrent = null;
    @api ariaDisabled = null;
    @api ariaExpanded = null;
    @api ariaHasPopup = null;
    @api ariaHidden = null;
    @api ariaInvalid = null;
    @api ariaLabel = null;
    @api ariaLevel = null;
    @api ariaMultiLine = null;
    @api ariaMultiSelectable = null;
    @api ariaOrientation = null;
    @api ariaPressed = null;
    @api ariaReadOnly = null;
    @api ariaRequired = null;
    @api ariaSelected = null;
    @api ariaSort = null;
    @api ariaValueMax = null;
    @api ariaValueMin = null;
    @api ariaValueNow = null;
    @api ariaValueText = null;
    @api ariaLive = null;
    @api ariaRelevant = null;
    @api ariaAtomic = null;
    @api ariaBusy = null;
    @api ariaActiveDescendant = null;
    @api ariaControls = null;
    @api ariaDescribedBy = null;
    @api ariaFlowTo = null;
    @api ariaLabelledBy = null;
    @api ariaOwns = null;
    @api ariaPosInSet = null;
    @api ariaSetSize = null;
    @api ariaColCount = null;
    @api ariaColSpan = null;
    @api ariaColIndex = null;
    @api ariaColIndexText = null;
    @api ariaDescription = null;
    @api ariaDetails = null;
    @api ariaErrorMessage = null;
    @api ariaKeyShortcuts = null;
    @api ariaModal = null;
    @api ariaPlaceholder = null;
    @api ariaRoleDescription = null;
    @api ariaRowCount = null;
    @api ariaRowIndex = null;
    @api ariaRowIndexText = null;
    @api ariaRowSpan = null;
    @api ariaBrailleLabel = null;
    @api ariaBrailleRoleDescription = null;
    @api role = null;
}

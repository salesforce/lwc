function testAriaProperty(property, attribute) {
    describe(property, () => {
        it(`should assign property ${property} to Element prototype`, () => {
            expect(Object.prototype.hasOwnProperty.call(Element.prototype, property)).toBe(true);
        });

        it(`should return null if the value is not set`, () => {
            const el = document.createElement('div');
            expect(el[property]).toBe(null);
        });

        it('should return the right value from the getter', () => {
            const el = document.createElement('div');
            el[property] = 'foo';
            expect(el[property]).toBe('foo');
        });

        it('should reflect the property to the associated attribute', () => {
            const el = document.createElement('div');
            el[property] = 'foo';
            expect(el.getAttribute(attribute)).toBe('foo');
        });

        it('should reflect the attribute to the property', () => {
            const el = document.createElement('div');
            el.setAttribute(attribute, 'foo');
            expect(el[property]).toBe('foo');
        });

        it('should remove the attribute if the property is set to null', () => {
            const el = document.createElement('div');
            el.setAttribute(attribute, 'foo');

            el[property] = null;
            expect(el.hasAttribute(attribute)).toBe(false);
        });
    });
}

const ariaPropertiesMapping = {
    ariaAutoComplete: 'aria-autocomplete',
    ariaChecked: 'aria-checked',
    ariaCurrent: 'aria-current',
    ariaDisabled: 'aria-disabled',
    ariaExpanded: 'aria-expanded',
    ariaHasPopup: 'aria-haspopup',
    ariaHidden: 'aria-hidden',
    ariaInvalid: 'aria-invalid',
    ariaLabel: 'aria-label',
    ariaLevel: 'aria-level',
    ariaMultiLine: 'aria-multiline',
    ariaMultiSelectable: 'aria-multiselectable',
    ariaOrientation: 'aria-orientation',
    ariaPressed: 'aria-pressed',
    ariaReadOnly: 'aria-readonly',
    ariaRequired: 'aria-required',

    // Disabling ariaSelected check because Chrome currently reflect the property to the aria-sort
    // attribute: https://bugs.chromium.org/p/chromium/issues/detail?id=914469
    // ariaSelected: 'aria-selected',

    ariaSort: 'aria-sort',
    ariaValueMax: 'aria-valuemax',
    ariaValueMin: 'aria-valuemin',
    ariaValueNow: 'aria-valuenow',
    ariaValueText: 'aria-valuetext',
    ariaLive: 'aria-live',
    ariaRelevant: 'aria-relevant',
    ariaAtomic: 'aria-atomic',
    ariaBusy: 'aria-busy',
    ariaActiveDescendant: 'aria-activedescendant',
    ariaControls: 'aria-controls',
    ariaDescribedBy: 'aria-describedby',
    ariaFlowTo: 'aria-flowto',
    ariaLabelledBy: 'aria-labelledby',
    ariaOwns: 'aria-owns',
    ariaPosInSet: 'aria-posinset',
    ariaSetSize: 'aria-setsize',
    ariaColCount: 'aria-colcount',
    ariaColSpan: 'aria-colspan',
    ariaColIndex: 'aria-colindex',
    ariaDetails: 'aria-details',
    ariaErrorMessage: 'aria-errormessage',
    ariaKeyShortcuts: 'aria-keyshortcuts',
    ariaModal: 'aria-modal',
    ariaPlaceholder: 'aria-placeholder',
    ariaRoleDescription: 'aria-roledescription',
    ariaRowCount: 'aria-rowcount',
    ariaRowIndex: 'aria-rowindex',
    ariaRowSpan: 'aria-rowspan',
    role: 'role',
};

for (const [ariaProperty, ariaAttribute] of Object.entries(ariaPropertiesMapping)) {
    testAriaProperty(ariaProperty, ariaAttribute);
}

function testAriaProperty(property, attribute, reflected) {
    describe(property, () => {
        it(`should ${
            reflected ? '' : 'not'
        } assign property ${property} to Element prototype`, () => {
            expect(Object.prototype.hasOwnProperty.call(Element.prototype, property)).toBe(
                reflected
            );
        });

        it(`should ${reflected ? '' : 'not'} return null if the value is not set`, () => {
            const el = document.createElement('div');
            expect(el[property]).toBe(reflected ? null : undefined);
        });

        it(`should return the right value from the getter`, () => {
            const el = document.createElement('div');
            el[property] = 'foo';
            expect(el[property]).toBe('foo');
        });

        it(`should ${
            reflected ? '' : 'not'
        } reflect the property to the associated attribute`, () => {
            const el = document.createElement('div');
            el[property] = 'foo';
            expect(el.getAttribute(attribute)).toBe(reflected ? 'foo' : null);
        });

        it(`should ${reflected ? '' : 'not'} reflect the attribute to the property`, () => {
            const el = document.createElement('div');
            el.setAttribute(attribute, 'foo');
            expect(el[property]).toBe(reflected ? 'foo' : undefined);
        });

        it(`should ${
            reflected ? '' : 'not'
        } remove the attribute if the property is set to null`, () => {
            const el = document.createElement('div');
            el.setAttribute(attribute, 'foo');

            el[property] = null;
            expect(el.hasAttribute(attribute)).toBe(!reflected);
        });
    });
}

const ariaPropertiesMapping = {
    ariaAtomic: 'aria-atomic',
    ariaAutoComplete: 'aria-autocomplete',
    ariaBusy: 'aria-busy',
    ariaChecked: 'aria-checked',
    ariaColCount: 'aria-colcount',
    ariaColIndex: 'aria-colindex',
    ariaColSpan: 'aria-colspan',
    ariaCurrent: 'aria-current',
    ariaDisabled: 'aria-disabled',
    ariaExpanded: 'aria-expanded',
    ariaHasPopup: 'aria-haspopup',
    ariaHidden: 'aria-hidden',
    ariaInvalid: 'aria-invalid',
    ariaKeyShortcuts: 'aria-keyshortcuts',
    ariaLabel: 'aria-label',
    ariaLevel: 'aria-level',
    ariaLive: 'aria-live',
    ariaModal: 'aria-modal',
    ariaMultiLine: 'aria-multiline',
    ariaMultiSelectable: 'aria-multiselectable',
    ariaOrientation: 'aria-orientation',
    ariaPlaceholder: 'aria-placeholder',
    ariaPosInSet: 'aria-posinset',
    ariaPressed: 'aria-pressed',
    ariaReadOnly: 'aria-readonly',
    ariaRelevant: 'aria-relevant',
    ariaRequired: 'aria-required',
    ariaRoleDescription: 'aria-roledescription',
    ariaRowCount: 'aria-rowcount',
    ariaRowIndex: 'aria-rowindex',
    ariaRowSpan: 'aria-rowspan',
    ariaSelected: 'aria-selected',
    ariaSetSize: 'aria-setsize',
    ariaSort: 'aria-sort',
    ariaValueMax: 'aria-valuemax',
    ariaValueMin: 'aria-valuemin',
    ariaValueNow: 'aria-valuenow',
    ariaValueText: 'aria-valuetext',
    role: 'role',
};

// The list includes prop->attr reflections that we have added in the past,
// but which are not part of AOM ARIA reflection as supported in browsers.
// https://github.com/salesforce/lwc/issues/2733
const nonReflectedAriaPropertiesMapping = {
    ariaActiveDescendant: 'aria-activedescendant',
    ariaControls: 'aria-controls',
    ariaDescribedBy: 'aria-describedby',
    ariaDetails: 'aria-details',
    ariaErrorMessage: 'aria-errormessage',
    ariaFlowTo: 'aria-flowto',
    ariaLabelledBy: 'aria-labelledby',
    ariaOwns: 'aria-owns',
};

for (const [ariaProperty, ariaAttribute] of Object.entries(ariaPropertiesMapping)) {
    testAriaProperty(ariaProperty, ariaAttribute, true);
}

for (const [ariaProperty, ariaAttribute] of Object.entries(nonReflectedAriaPropertiesMapping)) {
    testAriaProperty(ariaProperty, ariaAttribute, false);
}

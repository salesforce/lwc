import { createElement } from 'lwc';
import PatchesStylesheet from 'x/patchesStylesheet';
import PatchesStylesheetOnStylesheet from 'x/patchesStylesheetOnStylesheet';
import InspectStylesheets from 'x/inspectStylesheets';

describe('legacy undocumented stylesheetTokens API', () => {
    it('can patch a template with stylesheets onto a template without stylesheets', () => {
        const elm = createElement('x-patches-stylesheet', { is: PatchesStylesheet });
        expect(() => {
            document.body.appendChild(elm);
        }).toLogWarningDev([
            /Mutating the "stylesheets" property on a template is deprecated and will be removed in a future version of LWC/,
            /Mutating the "stylesheetToken" property on a template is deprecated and will be removed in a future version of LWC/,
        ]);
        const div = elm.shadowRoot.querySelector('div');
        expect(div.textContent).toEqual('without stylesheet');
        expect(getComputedStyle(div).color).toEqual('rgb(0, 0, 255)');
    });

    it('can patch a template with stylesheets onto a template with stylesheets', () => {
        const elm = createElement('x-patches-stylesheet-on-stylesheet', {
            is: PatchesStylesheetOnStylesheet,
        });
        expect(() => {
            document.body.appendChild(elm);
        }).toLogWarningDev([
            /Mutating the "stylesheets" property on a template is deprecated and will be removed in a future version of LWC/,
            /Mutating the "stylesheetToken" property on a template is deprecated and will be removed in a future version of LWC/,
        ]);
        const div = elm.shadowRoot.querySelector('div');
        expect(div.textContent).toEqual('a');
        expect(getComputedStyle(div).color).toEqual('rgb(0, 128, 0)');
    });

    it('reflects old stylesheetTokens API to/from new stylesheetToken API', () => {
        const elm = createElement('x-inspect-stylesheets', { is: InspectStylesheets });
        document.body.appendChild(elm);

        const { withStylesheet, withoutStylesheet } = elm;

        expect(typeof withStylesheet.stylesheetToken).toEqual('string');
        expect(typeof withStylesheet.stylesheetTokens).toEqual('object');
        expect(Object.keys(withStylesheet.stylesheetTokens).sort()).toEqual([
            'hostAttribute',
            'shadowAttribute',
        ]);
        expect(typeof withStylesheet.stylesheetTokens.hostAttribute).toEqual('string');
        expect(typeof withStylesheet.stylesheetTokens.shadowAttribute).toEqual('string');
        expect(typeof withoutStylesheet.stylesheetToken).toEqual('string');
        expect(typeof withoutStylesheet.stylesheetTokens).toEqual('object');
        expect(Object.keys(withoutStylesheet.stylesheetTokens).sort()).toEqual([
            'hostAttribute',
            'shadowAttribute',
        ]);

        expect(() => {
            // patch the one with a stylesheet onto the one without
            withoutStylesheet.stylesheetTokens = withStylesheet.stylesheetTokens;
        }).toLogWarningDev(
            /Mutating the "stylesheetTokens" property on a template is deprecated and will be removed in a future version of LWC/
        );

        // stylesheetTokens should reflect stylesheetToken
        expect(withoutStylesheet.stylesheetTokens).toEqual(withStylesheet.stylesheetTokens);
        expect(withoutStylesheet.stylesheetToken).toEqual(withStylesheet.stylesheetToken);
    });
});

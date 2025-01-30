import { LightningElement } from 'lwc';

const privateFields = undefined;
const api = undefined;
const stylesheetScopeToken = undefined;
const hasScopedStylesheets = undefined;
const defaultScopedStylesheets = undefined;

export default class extends LightningElement {
    connectedCallback() {
        // just use the variables to avoid them being tree-shaken
        Object.assign(
            {},
            {
                privateFields,
                api,
                stylesheetScopeToken,
                hasScopedStylesheets,
                defaultScopedStylesheets,
            }
        );
    }
}

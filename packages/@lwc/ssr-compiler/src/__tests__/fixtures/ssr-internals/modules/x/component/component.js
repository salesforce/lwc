import { LightningElement } from 'lwc';
import { SYMBOL__DEFAULT_TEMPLATE, SYMBOL__GENERATE_MARKUP } from '@lwc/ssr-runtime';

const myGenerateMarkup = () => '<p>hili</p>';
const myPublicProperties = ['philip'];
const myTmpl = () => {
    throw new Error('PHILIP');
};

export default class Component extends LightningElement {
    static [SYMBOL__DEFAULT_TEMPLATE] = myTmpl;
    static [SYMBOL__GENERATE_MARKUP] = myGenerateMarkup;
    static ['__lwcPublicProperties__'] = myPublicProperties;

    get isGenerateMarkupOverridden() {
        return Component[SYMBOL__DEFAULT_TEMPLATE] === myGenerateMarkup;
    }
    get isTmplOverridden() {
        return Component[SYMBOL__GENERATE_MARKUP] === myTmpl;
    }
    get isPublicPropsOverridden() {
        return Component['__lwcPublicProperties__'] === myPublicProperties;
    }
}

import { createElement, LightningElement } from 'lwc';

import Test from 'x/test';
import InvalidRenderMode from 'x/invalidRenderMode';

describe('Basic Light DOM', () => {
    it('should render properly', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.shadowRoot).toBeNull();
        expect(elm.firstChild.innerText).toEqual('Hello, Light DOM');
    });

    it('should return null for template', () => {
        let template;
        class TemplateTest extends LightningElement {
            static renderMode = 'light';
            connectedCallback() {
                template = this.template;
            }
        }

        expect(() => {
            const elm = createElement('x-test', { is: TemplateTest });
            document.body.appendChild(elm);
        }).toLogErrorDev(
            'Error: [LWC error]: `this.template` returns null for light DOM components. Since there is no shadow, the rendered content can be accessed via `this` itself. e.g. instead of `this.template.querySelector`, use `this.querySelector`.'
        );

        expect(template).toBeNull();
    });

    it('should log error when renderMode is invalid', () => {
        expect(() => {
            const elm = createElement('x-invalid-render-mode', { is: InvalidRenderMode });
            document.body.appendChild(elm);
        }).toLogErrorDev([
            /Invalid value for static property renderMode: 'sattar'\. renderMode must be either 'light' or 'shadow'\./,
            /Shadow DOM components template can't render light DOM templates/,
        ]);
    });
});

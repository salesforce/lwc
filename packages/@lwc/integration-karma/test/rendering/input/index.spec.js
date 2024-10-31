import { createElement } from 'lwc';
import { expectEquivalentDOM } from 'test-utils';
import Component from 'x/component';

it('renders <input checked> and <input value> the same whether static-optimized or not', async () => {
    const elm = createElement('x-component', { is: Component });
    document.body.appendChild(elm);

    await Promise.resolve();

    expectEquivalentDOM(
        elm,
        '<x-component>' +
            '<template shadowrootmode="open">' +
            '<input checked="">' +
            '<input checked="">' +
            '<input checked="">' +
            '<input checked="">' +
            '<input checked="">' +
            '<input checked="">' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input value="true">' +
            '<input value="">' +
            '<input value="value">' +
            '<input value="false">' +
            '<input value="true">' +
            '<input value="FALSE">' +
            '<input value="TRUE">' +
            '<input value="yolo">' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input disabled="">' +
            '<input disabled="">' +
            '<input disabled="disabled">' +
            '<input disabled="FALSE">' +
            '<input disabled="TRUE">' +
            '<input disabled="yolo">' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input disabled="">' +
            '<input>' +
            '<input>' +
            '<input>' +
            '<input disabled="">' +
            '<input disabled="">' +
            '<input>' +
            '<input disabled="">' +
            '<input disabled="">' +
            '</template>' +
            '</x-component>'
    );
});

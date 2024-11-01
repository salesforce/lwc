import { createElement } from 'lwc';
import Static from 'x/static';
import Dynamic from 'x/dynamic';

describe('renders <input> the same whether static-optimized or not', () => {
    it('static attributes', async () => {
        const elm = createElement('x-static', { is: Static });
        document.body.appendChild(elm);

        await Promise.resolve();

        const attrs = [...elm.shadowRoot.querySelectorAll('input')].map((_) =>
            Object.fromEntries([..._.attributes].map((_) => [_.name, _.value]))
        );

        expect(attrs).toEqual([
            {},
            {},
            {},
            {},
            {},
            {},
            {
                type: 'checkbox',
            },
            {
                type: 'checkbox',
            },
            {
                type: 'checkbox',
            },
            {
                type: 'checkbox',
            },
            {
                type: 'checkbox',
            },
            {
                type: 'checkbox',
            },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {
                disabled: '',
            },
            {
                disabled: '',
            },
            {
                disabled: 'disabled',
            },
            {
                disabled: 'FALSE',
            },
            {
                disabled: 'TRUE',
            },
            {
                disabled: 'yolo',
            },
        ]);
    });

    it('dynamic attributes', async () => {
        const elm = createElement('x-dynamic', { is: Dynamic });
        document.body.appendChild(elm);

        await Promise.resolve();

        const attrs = [...elm.shadowRoot.querySelectorAll('input')].map((_) =>
            Object.fromEntries([..._.attributes].map((_) => [_.name, _.value]))
        );

        expect(attrs).toEqual([
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {
                type: 'checkbox',
            },
            {
                type: 'checkbox',
            },
            {
                type: 'checkbox',
            },
            {
                type: 'checkbox',
            },
            {
                type: 'checkbox',
            },
            {
                type: 'checkbox',
            },
            {
                type: 'checkbox',
            },
            {
                type: 'checkbox',
            },
            {
                type: 'checkbox',
            },
            {
                type: 'checkbox',
            },
            {
                type: 'checkbox',
            },
            {
                type: 'checkbox',
            },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {
                disabled: '',
            },
            {},
            {},
            {},
            {
                disabled: '',
            },
            {
                disabled: '',
            },
            {},
            {
                disabled: '',
            },
            {
                disabled: '',
            },
        ]);
    });
});

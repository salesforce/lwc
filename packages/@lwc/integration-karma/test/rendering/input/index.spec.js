import { createElement } from 'lwc';
import Static from 'x/static';
import Dynamic from 'x/dynamic';

// It's important that we're grabbing the property rather than the attribute here.
// An element might be rendered as `<input type=checkbox>` but `input.checked` could
// still return true. `value` behaves similarly. `value` and `checked` behave surprisingly
// because the attributes actually represent the "default" value rather than the current one:
// - https://jakearchibald.com/2024/attributes-vs-properties/#value-on-input-fields
// - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#checked

function getRelevantInputProps(input) {
    const { disabled, checked, type, value } = input;
    return {
        disabled,
        checked,
        type,
        value,
    };
}

describe('renders <input> the same whether static-optimized or not', () => {
    it('static attributes', async () => {
        const elm = createElement('x-static', { is: Static });
        document.body.appendChild(elm);

        await Promise.resolve();

        const props = [...elm.shadowRoot.querySelectorAll('input')].map(getRelevantInputProps);

        expect(props).toEqual([
            {
                disabled: false,
                checked: true,
                type: 'checkbox',
                value: 'on',
            },
            {
                disabled: false,
                checked: true,
                type: 'checkbox',
                value: 'on',
            },
            {
                disabled: false,
                checked: true,
                type: 'checkbox',
                value: 'on',
            },
            {
                disabled: false,
                checked: true,
                type: 'checkbox',
                value: 'on',
            },
            {
                disabled: false,
                checked: true,
                type: 'checkbox',
                value: 'on',
            },
            {
                disabled: false,
                checked: true,
                type: 'checkbox',
                value: 'on',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: 'true',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: '',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: 'value',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: 'false',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: 'true',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: 'FALSE',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: 'TRUE',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: 'yolo',
            },
            {
                disabled: true,
                checked: false,
                type: 'text',
                value: '',
            },
            {
                disabled: true,
                checked: false,
                type: 'text',
                value: '',
            },
            {
                disabled: true,
                checked: false,
                type: 'text',
                value: '',
            },
            {
                disabled: true,
                checked: false,
                type: 'text',
                value: '',
            },
            {
                disabled: true,
                checked: false,
                type: 'text',
                value: '',
            },
            {
                disabled: true,
                checked: false,
                type: 'text',
                value: '',
            },
        ]);
    });

    it('dynamic attributes', async () => {
        const elm = createElement('x-dynamic', { is: Dynamic });
        document.body.appendChild(elm);

        await Promise.resolve();

        const props = [...elm.shadowRoot.querySelectorAll('input')].map(getRelevantInputProps);

        expect(props).toEqual([
            {
                disabled: false,
                checked: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                disabled: false,
                checked: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                disabled: false,
                checked: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                disabled: false,
                checked: true,
                type: 'checkbox',
                value: 'on',
            },
            {
                disabled: false,
                checked: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                disabled: false,
                checked: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                disabled: false,
                checked: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                disabled: false,
                checked: true,
                type: 'checkbox',
                value: 'on',
            },
            {
                disabled: false,
                checked: true,
                type: 'checkbox',
                value: 'on',
            },
            {
                disabled: false,
                checked: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                disabled: false,
                checked: true,
                type: 'checkbox',
                value: 'on',
            },
            {
                disabled: false,
                checked: true,
                type: 'checkbox',
                value: 'on',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: 'undefined',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: '',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: 'false',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: 'true',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: '0',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: '0',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: 'NaN',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: 'Infinity',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: '-Infinity',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: '',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: 'foo,bar',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: '[object Object]',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: '',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: '',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: '',
            },
            {
                disabled: true,
                checked: false,
                type: 'text',
                value: '',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: '',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: '',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: '',
            },
            {
                disabled: true,
                checked: false,
                type: 'text',
                value: '',
            },
            {
                disabled: true,
                checked: false,
                type: 'text',
                value: '',
            },
            {
                disabled: false,
                checked: false,
                type: 'text',
                value: '',
            },
            {
                disabled: true,
                checked: false,
                type: 'text',
                value: '',
            },
            {
                disabled: true,
                checked: false,
                type: 'text',
                value: '',
            },
        ]);
    });
});

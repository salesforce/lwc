import { createElement } from 'lwc';
import Static from 'x/static';
import Dynamic from 'x/dynamic';
import Updatable from 'x/updatable';

// `<input checked="...">` and `<input value="...">` have a peculiar attr/prop relationship, so the engine
// has historically treated them as props rather than attributes:
// https://github.com/salesforce/lwc/blob/b584d39/packages/%40lwc/template-compiler/src/parser/attribute.ts#L217-L221
// For example, an element might be rendered as `<input type=checkbox>` but `input.checked` could
// still return true. `value` behaves similarly. `value` and `checked` behave surprisingly
// because the attributes actually represent the "default" value rather than the current one:
// - https://jakearchibald.com/2024/attributes-vs-properties/#value-on-input-fields
// - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#checked
// Here we check both the "default" and "runtime" variants of `checked`/`value`. Note that
// `defaultChecked`/`defaultValue` correspond to the `checked`/`value` attributes.
function getRelevantInputProps(input) {
    const { defaultChecked, defaultValue, disabled, checked, type, value } = input;
    return {
        checked,
        defaultChecked,
        defaultValue,
        disabled,
        type,
        value,
    };
}

describe('renders <input> the same whether static-optimized or not', () => {
    it('static values', async () => {
        const elm = createElement('x-static', { is: Static });
        document.body.appendChild(elm);

        await Promise.resolve();
        const props = [...elm.shadowRoot.querySelectorAll('input')].map(getRelevantInputProps);

        expect(props).toEqual([
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: 'true',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: 'value',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: 'false',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: 'true',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: 'FALSE',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: 'TRUE',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: 'yolo',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: true,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: true,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: true,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: true,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: true,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: true,
                type: 'text',
                value: '',
            },
        ]);
    });

    it('dynamic values', async () => {
        const elm = createElement('x-dynamic', { is: Dynamic });
        document.body.appendChild(elm);

        await Promise.resolve();
        const props = [...elm.shadowRoot.querySelectorAll('input')].map(getRelevantInputProps);

        expect(props).toEqual([
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: 'undefined',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: 'false',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: 'true',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '0',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '0',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: 'NaN',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: 'Infinity',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '-Infinity',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: 'foo,bar',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '[object Object]',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: true,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: true,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: true,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: true,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: true,
                type: 'text',
                value: '',
            },
        ]);
    });

    it('updatable values', async () => {
        const elm = createElement('x-updatable', { is: Updatable });
        document.body.appendChild(elm);

        await Promise.resolve();
        let props = [...elm.shadowRoot.querySelectorAll('input')].map(getRelevantInputProps);

        expect(props).toEqual([
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: 'undefined',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
        ]);

        elm.checked = true;
        elm.value = 'new value!';

        await Promise.resolve();
        props = [...elm.shadowRoot.querySelectorAll('input')].map(getRelevantInputProps);

        expect(props).toEqual([
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
            {
                checked: true,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'checkbox',
                value: 'on',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: 'new value!',
            },
            {
                checked: false,
                defaultChecked: false,
                defaultValue: '',
                disabled: false,
                type: 'text',
                value: '',
            },
        ]);
    });
});

import { createElement } from 'lwc';
import Static from 'x/static';
import Dynamic from 'x/dynamic';

// An element might be rendered as `<input type=checkbox>` but `input.checked` could
// still return true. `value` behaves similarly. `value` and `checked` behave surprisingly
// because the attributes actually represent the "default" value rather than the current one.
// The `defaultChecked` and `defaultValue` IDL attributes (props) correspond to the `checked`
// and `value` IDL content attributes (attributes).
// - https://jakearchibald.com/2024/attributes-vs-properties/#value-on-input-fields
// - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#checked
function getRelevantInputProps(input) {
    const { defaultChecked, defaultValue, disabled, checked, type, value } = input;
    return {
        defaultChecked,
        defaultValue,
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
            // FIXME
        ]);
    });

    it('dynamic attributes', async () => {
        const elm = createElement('x-dynamic', { is: Dynamic });
        document.body.appendChild(elm);

        await Promise.resolve();

        const props = [...elm.shadowRoot.querySelectorAll('input')].map(getRelevantInputProps);

        expect(props).toEqual([
            // FIXME
        ]);
    });
});

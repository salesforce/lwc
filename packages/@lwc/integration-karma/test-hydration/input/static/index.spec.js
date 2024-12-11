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

export default {
    snapshot(target) {
        const inputs = target.shadowRoot.querySelectorAll('input');
        return {
            inputs,
        };
    },
    test(target, snapshots, consoleCalls) {
        const inputs = target.shadowRoot.querySelectorAll('input');

        expect(inputs.length).toBe(snapshots.inputs.length);
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            expect(input).toBe(snapshots.inputs[i]);

            // "default" checked/value are not set by either SSR or runtime
            expect(input.defaultValue).toBe('');
            expect(input.defaultChecked).toBe(false);
        }

        expect([...inputs].map(getRelevantInputProps)).toEqual([
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

        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);
    },
};

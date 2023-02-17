export default {
    props: {
        isFalse: false,
        isUndefined: undefined,
        isNull: null,
        isTrue: true,
        isEmptyString: '',
        isZero: 0,
        isNaN: NaN,
    },
    clientProps: {
        isFalse: 'false',
        isUndefined: 'undefined', // mismatch. should be literally `null`, not the string `"undefined"`
        isNull: 'null', // mismatch. should be literally `null`, not the string `"null"`
        isTrue: 'true',
        isEmptyString: '',
        isZero: '0',
        isNaN: 'NaN',
    },
    test(target, snapshots, consoleCalls) {
        const divs = target.shadowRoot.querySelectorAll('div');

        const expectedAttrValues = ['false', 'undefined', 'null', 'true', '', '0', 'NaN'];

        expect(divs).toHaveSize(expectedAttrValues.length);

        for (let i = 0; i < expectedAttrValues.length; i++) {
            expect(divs[i].getAttribute('data-foo')).toEqual(expectedAttrValues[i]);
        }

        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(3);
        expect(consoleCalls.error[0][0].message).toContain(
            'Mismatch hydrating element <div>: attribute "data-foo" has different values, expected "undefined" but found null'
        );
        expect(consoleCalls.error[1][0].message).toContain(
            'Mismatch hydrating element <div>: attribute "data-foo" has different values, expected "null" but found null'
        );
        expect(consoleCalls.error[2][0].message).toContain('Hydration completed with errors.');
    },
};

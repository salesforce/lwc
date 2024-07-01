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

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            warn: [],
            error: [
                'Mismatch hydrating element <div>: attribute "data-foo" has different values, expected "undefined" but found null',
                'Mismatch hydrating element <div>: attribute "data-foo" has different values, expected "null" but found null',
                'Hydration completed with errors.',
            ],
        });
    },
};

export default {
    test(target, snapshots, consoleCalls) {
        const divs = target.shadowRoot.querySelectorAll('div');

        const expectedAttrValues = ['false', null, null, 'true', '', '0', 'NaN'];

        expect(divs).toHaveSize(expectedAttrValues.length);

        for (let i = 0; i < expectedAttrValues.length; i++) {
            expect(divs[i].getAttribute('data-foo')).toEqual(expectedAttrValues[i]);
        }

        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);
    },
};

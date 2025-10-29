/** @type {import('../../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    async test(target) {
        expect(getComputedStyle(target).backgroundColor).toEqual('rgb(0, 0, 255)');
        expect(getComputedStyle(target.shadowRoot.querySelector('div')).color).toEqual(
            'rgb(255, 0, 0)'
        );

        await Promise.resolve();
        expect(
            getComputedStyle(target.shadowRoot.querySelector('c-light-child div')).color
        ).not.toEqual('rgb(255, 0, 0)');
    },
};

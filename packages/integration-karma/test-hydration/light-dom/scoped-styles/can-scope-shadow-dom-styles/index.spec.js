export default {
    test(target) {
        // @todo: this failure may have to do with SSR, need to check.
        expect(getComputedStyle(target).backgroundColor).toEqual('rgb(0, 0, 255)');
        expect(getComputedStyle(target.shadowRoot.querySelector('div')).color).toEqual(
            'rgb(255, 0, 0)'
        );
        expect(
            getComputedStyle(target.shadowRoot.querySelector('x-light-child div')).color
        ).not.toEqual('rgb(255, 0, 0)');
    },
};

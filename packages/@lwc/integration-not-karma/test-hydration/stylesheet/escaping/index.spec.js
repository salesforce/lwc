export default {
    test(target, snapshots, consoleCalls) {
        const h1 = target.shadowRoot.querySelector('h1');
        const h2 = target.shadowRoot.querySelector('h2');
        const div = target.shadowRoot.querySelector('div');

        expect(getComputedStyle(h1).color).toEqual('rgb(255, 0, 0)');
        expect(getComputedStyle(h1).backgroundColor).toEqual('rgb(0, 0, 255)');

        expect(getComputedStyle(h2).color).toEqual('rgb(0, 128, 0)');

        expect(getComputedStyle(div).color).toEqual('rgb(128, 0, 128)');
        expect(getComputedStyle(div).backgroundColor).toEqual('rgb(255, 255, 0)');

        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);
    },
};

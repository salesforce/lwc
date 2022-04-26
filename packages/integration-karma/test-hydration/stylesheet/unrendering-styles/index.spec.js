const parentTags = [
    'x-light-parent-light-child',
    'x-light-parent-shadow-child',
    'x-shadow-parent-light-child',
];

export default {
    test(rootElement) {
        let promise = Promise.resolve();
        for (const parentTag of parentTags) {
            promise = promise.then(() => {
                const parent = rootElement.querySelector(parentTag);
                const child = (parent.shadowRoot || parent).querySelector('x-light,x-shadow');

                function getDivColor() {
                    return getComputedStyle((child.shadowRoot || child).querySelector('div')).color;
                }

                expect(getDivColor()).toEqual('rgb(255, 0, 0)');
                child.next();
                return Promise.resolve()
                    .then(() => {
                        expect(getDivColor()).toEqual('rgb(0, 0, 255)');
                        child.next();
                    })
                    .then(() => {
                        expect(getDivColor()).toEqual('rgb(255, 0, 0)');
                        child.next();
                    })
                    .then(() => {
                        expect(getDivColor()).toEqual('rgb(0, 0, 255)');
                        child.next();
                    })
                    .then(() => {
                        expect(getDivColor()).toEqual('rgb(255, 0, 0)');
                    });
            });
        }
        return promise;
    },
};

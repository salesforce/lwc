export default {
    test(target) {
        const rafPromise = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));

        // A (no styles) -> B (styles) -> C (no styles) -> D (styles)
        expect(getComputedStyle(target).marginLeft).toEqual('0px');
        expect(getComputedStyle(target.querySelector('div')).color).toEqual('rgb(0, 0, 0)');
        target.next();
        return rafPromise()
            .then(() => {
                expect(getComputedStyle(target).marginLeft).toEqual('20px');
                expect(getComputedStyle(target.querySelector('div')).color).toEqual(
                    'rgb(255, 0, 0)'
                );
                target.next();
                return rafPromise();
            })
            .then(() => {
                expect(getComputedStyle(target).marginLeft).toEqual('0px');
                expect(getComputedStyle(target.querySelector('div')).color).toEqual('rgb(0, 0, 0)');
                target.next();
                return rafPromise();
            })
            .then(() => {
                expect(getComputedStyle(target).marginLeft).toEqual('30px');
                expect(getComputedStyle(target.querySelector('div')).color).toEqual(
                    'rgb(0, 0, 255)'
                );
            });
    },
};

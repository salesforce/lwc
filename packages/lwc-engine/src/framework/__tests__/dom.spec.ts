import "../dom";

describe('dom', () => {
    describe('composed polyfill', () => {
        it('should get native events as composed true', function () {
            expect.assertions(1);
            const elm = document.createElement('div');
            document.body.appendChild(elm);
            elm.addEventListener('click', function (e) {
                expect(e.composed).toBe(true);
            });
            elm.click();
        });
        // TODO: flapper
        // it('should get custom events as composed false', function () {
        //     expect.assertions(1);
        //     const elm = document.createElement('div');
        //     document.body.appendChild(elm);
        //     elm.addEventListener('bar', function (e) {
        //         expect(e.composed).toBe(false);
        //     });
        //     elm.dispatchEvent(new CustomEvent('bar', {}));
        // });
        it('should allow customization of composed init in custom events', function () {
            expect.assertions(1);
            const elm = document.createElement('div');
            document.body.appendChild(elm);
            elm.addEventListener('foo', function (e) {
                expect(e.composed).toBe(true);
            });
            elm.dispatchEvent(new CustomEvent('foo', { composed: true }));
        });
    });
});

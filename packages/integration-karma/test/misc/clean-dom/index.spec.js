describe('clean DOM', () => {
    it('inserts elements to dirty the DOM', () => {
        // insert to the body
        const el = document.createElement('div');
        el.className = 'yolo';
        document.body.appendChild(el);
        expect(document.querySelector('.yolo')).toEqual(el);

        // insert to the head as well
        const style = document.createElement('style');
        style.textContent = 'html { background-color: green }';
        style.id = 'the-style';
        document.head.appendChild(style);
        expect(document.querySelector('#the-style')).toEqual(style);
    });

    // ordering of tests is guaranteed when using `random: false` option in Jasmine
    // https://jasmine.github.io/api/edge/Configuration#random
    it('DOM is clean after each test', () => {
        expect(document.querySelector('.yolo')).toBeNull();
        expect(document.querySelector('#the-style')).toBeNull();
    });
});

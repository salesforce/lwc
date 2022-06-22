describe('clean DOM', () => {
    // We do two identical tests here because Jasmine randomizes the order of tests, so we can't
    // be sure which one will dirty the DOM and which one will check that it's clean.
    for (let i = 0; i < 2; i++) {
        it(`DOM is clean after each test ${i + 1}`, () => {
            // insert to the body
            const el = document.createElement('div');
            el.className = `body-${i}`;
            document.body.appendChild(el);
            expect(document.querySelector(`.body-${i}`)).toEqual(el);

            // insert to the head as well
            const style = document.createElement('style');
            style.textContent = 'html { background-color: green }';
            style.className = `head-${i}`;
            document.head.appendChild(style);
            expect(document.querySelector(`.head-${i}`)).toEqual(style);

            // insert adoptedStyleSheets too
            if (document.adoptedStyleSheets) {
                const styleSheet = new CSSStyleSheet();
                styleSheet[`__lwc_${i}__`] = true;
                document.adoptedStyleSheets = [...document.adoptedStyleSheets];
            }

            // check that we don't have dirty DOM nodes from the other test
            expect(document.querySelector(`.body-${1 - i}`)).toBeNull();
            expect(document.querySelector(`.head-${1 - i}`)).toBeNull();
            if (document.adoptedStyleSheets) {
                expect(
                    [...document.adoptedStyleSheets].find((_) => _[`__lwc_${1 - i}__`])
                ).toBeUndefined();
            }
        });
    }
});

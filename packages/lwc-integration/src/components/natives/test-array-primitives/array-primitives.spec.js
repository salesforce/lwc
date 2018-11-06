const assert = require('assert');
describe('Testing array primitives', () => {
    const URL = 'http://localhost:4567/array-primitives';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('page load', () => {
        const title = browser.getTitle();
        assert.equal(title, 'array-primitives');
    });

    it('check initial state', function () {
        const initialLength = 5;
        const { value } = browser.execute(function () {
            return document.querySelector('integration-array-primitives').shadowRoot.querySelectorAll('li').length
        });

        assert.equal(value, initialLength);
    });

    it('check splice reactivity', function () {
        const splicedList = [ 'one', 'three', 'four', 'five' ];
        const splicedLength = splicedList.length;
        browser.executeAsync(function (done) {
            document.querySelector('integration-array-primitives').shadowRoot.querySelector('.splice').click();

            setTimeout(done, 0)
        });

        // Technically a microtask is not needed since selenium already does macrotasking

        const { value } = browser.execute(function () {
            var list = Array.prototype.slice.call(
                document.querySelector('integration-array-primitives').shadowRoot.querySelectorAll('li')
            );

            return list.map(function (li) {
                return li.textContent;
            });
        });

        assert.equal(value.length, splicedLength);
        assert.deepEqual(value, splicedList);
    });
});

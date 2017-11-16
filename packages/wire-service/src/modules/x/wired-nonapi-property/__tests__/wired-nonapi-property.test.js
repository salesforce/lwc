import PrivateWiredNonapiProperty from 'x-wired-nonapi-property';
import { createElement } from 'engine';
import { registerMockWireAdapters } from 'x-wire-adapter-mock';

describe('wired-nonapi-property', () => {
    const {
        test: mockTestAdapter
    } = registerMockWireAdapters('test');

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('invokes wire adapter when non-public property changes', () => {
        const element = createElement('x-wired-nonapi-property', { is: PrivateWiredNonapiProperty });

        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            element.field = 'first';
            expect(mockTestAdapter.lastInitializedArgs()).toEqual([{field: 'first'}]);
        }).then(() => {
            element.field = 'second';
            expect(mockTestAdapter.lastInitializedArgs()).toEqual([{field: 'second'}]);
        });
    });
});

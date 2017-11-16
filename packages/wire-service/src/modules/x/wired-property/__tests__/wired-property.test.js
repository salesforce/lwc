import WiredProperty from 'x-wired-property';
import { createElement } from 'engine';
import { registerMockWireAdapters } from 'x-wire-adapter-mock';

describe('wired-property', () => {
    const {
        test: mockTestAdapter
    } = registerMockWireAdapters('test');

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    describe('snapshots', () => {
        it('default snapshot', () => {
            const element = createElement('x-wired-property', { is: WiredProperty });
            document.body.appendChild(element);
            expect(element).toMatchSnapshot();
        });

        it('should display data correctly', () => {
            const element = createElement('x-wired-property', { is: WiredProperty });
            document.body.appendChild(element);
            mockTestAdapter.data({
                Name: 'name'
            });

            return Promise.resolve().then(() => {
                expect(element).toMatchSnapshot();
            });
        });

        it('should display error correctly', () => {
            const element = createElement('x-wired-property', { is: WiredProperty });
            document.body.appendChild(element);
            mockTestAdapter.error('error message');

            return Promise.resolve().then(() => {
                expect(element).toMatchSnapshot();
            });
        });

        it('should display complete correctly', () => {
            const element = createElement('x-wired-property', { is: WiredProperty });
            document.body.appendChild(element);
            mockTestAdapter.complete();

            return Promise.resolve().then(() => {
                expect(element).toMatchSnapshot();
            });
        });
    });
});

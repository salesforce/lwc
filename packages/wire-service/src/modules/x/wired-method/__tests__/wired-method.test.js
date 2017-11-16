import WiredMethod  from 'x-wired-method';
import { createElement } from 'engine';
import { registerMockWireAdapters } from 'x-wire-adapter-mock';

describe('wired-method', () => {
    const {
        test: mockTestAdapter
    } = registerMockWireAdapters('test');

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('should have initialized wire service correctly', () => {
        const elem = createElement('x-wired-method', { is: WiredMethod });
        document.body.appendChild(elem);

        expect(mockTestAdapter.init.mock.calls.length).toBe(1);
        expect(mockTestAdapter.lastInitializedArgs()).toEqual([{
            fields: ['Name']
        }]);
    });

    describe('snapshots', () => {
        it('should display data correctly', () => {
            const elem = createElement('wired-method', { is: WiredMethod });
            document.body.appendChild(elem);
            mockTestAdapter.data({
                Name: 'name'
            });

            return Promise.resolve().then(() => {
                expect(elem).toMatchSnapshot();
            });
        });

        it('should display error correctly', () => {
            const elem = createElement('wired-method', { is: WiredMethod });
            document.body.appendChild(elem);
            mockTestAdapter.error('error message');

            return Promise.resolve().then(() => {
                expect(elem).toMatchSnapshot();
            });
        });

        it('should display complete correctly', () => {
            const elem = createElement('wired-method', { is: WiredMethod });
            document.body.appendChild(elem);
            mockTestAdapter.complete();

            return Promise.resolve().then(() => {
                expect(elem).toMatchSnapshot();
            });
        });
    });
});

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
            const elem = createElement('x-wired-method', { is: WiredMethod });
            document.body.appendChild(elem);
            mockTestAdapter.next({
                Name: 'name'
            });

            return Promise.resolve().then(() => {
                expect(elem).toMatchSnapshot();
            });
        });

        it('should display error correctly', () => {
            const elem = createElement('x-wired-method', { is: WiredMethod });
            document.body.appendChild(elem);
            mockTestAdapter.error('error message');

            return Promise.resolve().then(() => {
                expect(elem).toMatchSnapshot();
            });
        });

        it('should display complete correctly', () => {
            const elem = createElement('x-wired-method', { is: WiredMethod });
            document.body.appendChild(elem);
            mockTestAdapter.complete();

            return Promise.resolve().then(() => {
                expect(elem).toMatchSnapshot();
            });
        });
    });

    describe('component lifecycle hooks', () => {
        it('should get data when created', () => {
            const element = createElement('x-wired-method', { is: WiredMethod });
            mockTestAdapter.next({
                Name: 'name'
            });

            document.body.appendChild(element);

            expect(element.textContent.substring('Name: '.length, element.textContent.indexOf('Error'))).toBe('name');
        });

        it('should stop receiving data when disconnected', () => {
            const element = createElement('x-wired-method', { is: WiredMethod });
            document.body.appendChild(element);
            mockTestAdapter.next({
                Name: 'name'
            });
            document.body.removeChild(element);
            mockTestAdapter.next({
                Name: 'new_name'
            });

            expect(element.textContent.substring('Name: '.length, element.textContent.indexOf('Error'))).toBe('');
        });

        it('should receive data when reconnected', () => {
            const element = createElement('x-wired-method', { is: WiredMethod });
            document.body.appendChild(element);
            mockTestAdapter.next({
                Name: 'name'
            });
            document.body.removeChild(element);
            mockTestAdapter.next({
                Name: 'new_name'
            });
            document.body.appendChild(element);

            expect(element.textContent.substring('Name: '.length, element.textContent.indexOf('Error'))).toBe('new_name');
        });
    });
});

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
            mockTestAdapter.next({
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

    describe('component lifecycle hooks', () => {
        it('should get data when created', () => {
            const element = createElement('x-wired-property', { is: WiredProperty });
            mockTestAdapter.next({
                Name: 'name'
            });

            document.body.appendChild(element);

            expect(element.textContent.substring('Name: '.length, element.textContent.indexOf('Error'))).toBe('name');
        });

        it('should stop receiving data when disconnected', () => {
            const element = createElement('x-wired-property', { is: WiredProperty });
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
            const element = createElement('x-wired-property', { is: WiredProperty });
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

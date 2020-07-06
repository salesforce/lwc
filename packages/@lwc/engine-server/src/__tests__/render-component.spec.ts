import { renderComponent, LightningElement } from '../index';

class Test extends LightningElement {}

describe('renderComponent', () => {
    it('returns the rendered tree as string', () => {
        expect(renderComponent('x-test', Test)).toBe(
            '<x-test><template shadow-root></template></x-test>'
        );
    });

    it.each([undefined, null, 1, {}, () => {}])(
        'asserts the first parameter is a string (type: %p)',
        (value) => {
            expect(() => renderComponent(value as any, Test, {})).toThrow(
                `"renderComponent" expects a string as first parameter but received ${value}.`
            );
        }
    );

    it.each([undefined, null, 1, 'test', {}])(
        'asserts the seconds parameter is a function (type: %p)',
        (value) => {
            expect(() => renderComponent('x-test', value as any, {})).toThrow(
                `"renderComponent" expects a valid component constructor as second parameter but received ${value}.`
            );
        }
    );

    it.each([null, 1, 'test', () => {}])(
        'asserts the third parameter is an object (type: %p)',
        (value) => {
            expect(() => renderComponent('x-test', Test, value as any)).toThrow(
                `"renderComponent" expected an object as third parameter but received ${value}.`
            );
        }
    );
});

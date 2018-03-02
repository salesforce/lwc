import './../reactive-dev-formatter';
import * as target from '../reactive';

describe('reactive dev formatter', function() {
    it('should add an array to window', function() {
        expect(window.devtoolsFormatters).toBeDefined();
    });

    it('should return null when given a plain object', function() {
        expect(window.devtoolsFormatters[0].header({})).toBe(null);
    });

    it('should return correct object when given reactive proxy', function() {
        const el = document.createElement('div');
        const proxy = target.getReactiveProxy({ foo: 'bar', el });
        const result = window.devtoolsFormatters[0].header(proxy);
        expect(result).toEqual([
            'object', {
                object: {
                    foo: 'bar',
                    el
                }
            }
        ]);
        expect(result[1].object.el).toBe(el);
    });
});

import './../reactive-dev-formatter';
import { ReactiveMembrane } from './../reactive-membrane';

describe('reactive dev formatter', function() {
    it('should add an array to window', function() {
        expect((window as any).devtoolsFormatters).toBeDefined();
    });

    it('should return null when given a plain object', function() {
        expect((window as any).devtoolsFormatters[0].header({})).toBe(null);
    });

    it('should return correct object when given reactive proxy', function() {
        const el = document.createElement('div');
        const reactiveMembrane = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => { /* do nothing */ },
            propertyMemberAccess: () => { /* do nothing */ },
        });
        const proxy = reactiveMembrane.getProxy({ foo: 'bar', el });
        const result = (window as any).devtoolsFormatters[0].header(proxy);
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

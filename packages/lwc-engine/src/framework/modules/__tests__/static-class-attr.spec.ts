import target from '../static-class-attr';

describe('module/static-class-attr', () => {
    it('should apply data.classMap', () => {
        const elm = document.createElement('p');
        const vnode = { elm, data: { classMap: { foo: true } } };

        target.create(vnode);
        expect(elm.className).toBe('foo');
    });

    it('should preserve other classnames', () => {
        const elm = document.createElement('p');
        elm.className = 'manual';
        const vnode = { elm,
            data: { classMap: { foo: true, bar: true, } },
        };

        target.create(vnode);
        expect(elm.className).toBe('manual foo bar');
    });

});

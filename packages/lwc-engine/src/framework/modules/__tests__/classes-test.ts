import target from '../classes';

describe('module/classes', () => {
    it('should apply data.class', () => {
        const elm = document.createElement('p');
        const vnode = { elm, data: { class: { foo: true } } };

        target.create({data: {}}, vnode);
        expect(elm.className).toBe('foo');
    });

    it('should remove from oldData.class', () => {
        const elm = document.createElement('p');
        elm.className = 'baz manual';
        const vnode = { elm,
            data: { class: { foo: true, bar: true, } },
        };

        target.create({data: { class: { baz: true } }}, vnode);
        expect(elm.className).toBe('manual foo bar');
    });

});

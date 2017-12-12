import target from '../component-classes';

describe('module/component-classes', () => {
    it('should apply vm.cmpClasses', () => {
        const elm = document.createElement('p');
        const vnode = { elm, data: {}, vm: { cmpClasses: { foo: true } } };

        target.create({data: {}, vm: {}}, vnode);
        expect(elm.className).toBe('foo');
    });

    it('should apply vm.cmpClasses but ignore data.class', () => {
        const elm = document.createElement('p');
        const vnode = { elm,
            data: { class: { foo: true, bar: true } },
            vm: { cmpClasses: { baz: true } }
        };

        target.create({data: {}, vm: {}}, vnode);
        expect(elm.className).toBe('baz');
    });

    it('should apply vm.cmpClasses but ignore data.class with conflicts', () => {
        const elm = document.createElement('p');
        const vnode = { elm,
            data: { class: { foo: false, bar: true, } },
            vm: { cmpClasses: { foo: true, baz: true } }
        };

        target.create({data: {}, vm: {}}, vnode);
        expect(elm.className).toBe('foo baz');
    });


    it('should remove from oldVm.cmpClasses', () => {
        const elm = document.createElement('p');
        elm.className = 'foo manual';
        const oldVnode = {data: {}, vm: { cmpClasses: { foo: true, baz: false } }};
        const vnode = { elm,
            data: {},
            vm: { cmpClasses: { foo: false, baz: true } }
        };

        target.create(oldVnode, vnode);
        expect(elm.className).toBe('manual baz');
    });

    it('should remove from oldVm.cmpClasses but check data.class with conflicts', () => {
        const elm = document.createElement('p');
        elm.className = 'foo manual';
        const oldVnode = { elm,
            data: { class: { foo: true, bar: false, } },
            vm: { cmpClasses: { foo: true, bar: false } }
        };
        const vnode = { elm,
            data: { class: { foo: true, bar: false, } },
            vm: { cmpClasses: { foo: false, bar: true } }
        };
        target.create(oldVnode, vnode);
        expect(elm.className).toBe('foo manual bar');
    });

});

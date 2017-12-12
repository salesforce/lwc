import target from '../classes';

describe('module/classes', () => {
    it('should apply data.class', () => {
        const elm = document.createElement('p');
        const vnode = { elm, data: { class: { foo: true } } };

        target.create({data: {}}, vnode);
        expect(elm.className).toBe('foo');
    });

    it('should apply data.class but ignore vm.cmpClasses', () => {
        const elm = document.createElement('p');
        const vnode = { elm,
            data: { class: { foo: true, bar: true } },
            vm: { cmpClasses: { baz: true } }
        };

        target.create({data: {}}, vnode);
        expect(elm.className).toBe('foo bar');
    });

    it('should use data.class but ignore vm.cmpClasses with conflicts', () => {
        const elm = document.createElement('p');
        const vnode = { elm,
            data: { class: { foo: true, bar: true, } },
            vm: { cmpClasses: { foo: false, baz: true } }
        };

        target.create({data: {}}, vnode);
        expect(elm.className).toBe('foo bar');
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

    it('should remove from oldData.class but check vm.cmpClasses with conflicts', () => {
        const elm = document.createElement('p');
        elm.className = 'foo bar';
        const oldVnode = { elm,
            data: { class: { foo: true, bar: true, } },
            vm: { cmpClasses: { foo: true, bar: false } }
        };
        const vnode = { elm,
            data: { class: { foo: true } },
            vm: { cmpClasses: { foo: false, bar: true } }
        };
        target.create(oldVnode, vnode);
        expect(elm.className).toBe('foo bar');
    });

});

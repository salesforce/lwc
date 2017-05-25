import target from '../component-classes';
import assert from 'power-assert';

describe('module/component-classes', () => {
    it('should apply vm.cmpClasses', () => {
        const elm = document.createElement('p');
        const vnode = { elm, data: {}, vm: { cmpClasses: { foo: true } } };

        target.create({data: {}, vm: {}}, vnode);
        assert.equal('foo', elm.className);
    });

    it('should apply vm.cmpClasses but ignore data.class', () => {
        const elm = document.createElement('p');
        const vnode = { elm,
            data: { class: { foo: true, bar: true } },
            vm: { cmpClasses: { baz: true } }
        };

        target.create({data: {}, vm: {}}, vnode);
        assert.equal('baz', elm.className);
    });

    it('should apply vm.cmpClasses but ignore data.class with conflicts', () => {
        const elm = document.createElement('p');
        const vnode = { elm,
            data: { class: { foo: false, bar: true, } },
            vm: { cmpClasses: { foo: true, baz: true } }
        };

        target.create({data: {}, vm: {}}, vnode);
        assert.equal('foo baz', elm.className);
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
        assert.equal('manual baz', elm.className);
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
        assert.equal('foo manual bar', elm.className);
    });

});

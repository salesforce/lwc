import target from '../component-classes';
import assert from 'power-assert';

describe('module/component-classes.js', () => {
    it('should convert className to a classMap property', () => {
        const vnode = { data: { className: 'foo' } };

        target.create(null, vnode);
        assert.deepEqual(vnode.data.class, { foo: true });
    });

    it('should split classNames on white spaces', () => {
        const vnode = { data: { className: 'foo bar   baz' } };

        target.create(null, vnode);
        assert.deepEqual(vnode.data.class, { foo: true, bar: true, baz: true });
    });

    it('should merge component classMap with vnode computed className', () => {
        const vnode = {
            data: { className: 'foo bar' },
            vm: { cmpClasses: { baz: true } }
        };

        target.create(null, vnode);
        assert.deepEqual(vnode.data.class, { foo: true, bar: true, baz: true });
    });

    it('should merge component classMap with vnode classMap', () => {
        const vnode = {
            data: { classMap: { foo: true, bar: true } },
            vm: { cmpClasses: { baz: true } }
        };

        target.create(null, vnode);
        assert.deepEqual(vnode.data.class, { foo: true, bar: true, baz: true });
    });

    it('should throw if the vnode contains both a computed className and a classMap', () => {
        const vnode = {
            data: {
                className: 'foo',
                classMap: { foo: true }
            },
        };

        assert.throws(
            () => target.create(null, vnode),
            /vnode.data.classMap cannot be present when vnode.data.className/
        );
    });
});

import { ClassList } from "../class-list.js";
import assert from 'power-assert';

describe('ClassList', () => {
    describe('#constructor()', () => {

        it('should create an empty vm.cmpClasses object', () => {
            const vmMock: vm = { component: {} };
            let cl = new ClassList(vmMock);
            cl.add('foo', 'bar');
            cl.remove('bar');
            assert.deepEqual(vmMock.cmpClasses, {
                foo: true,
                bar: false,
            });
        });

        it('should throw for invalid vm', () => {
            assert.throws(() => new ClassList({}), "Number value");
        });

    });
});

import * as target from "../def.js";
import assert from 'power-assert';

describe('def.js', () => {
    describe('#getComponentDef()', () => {

        it('should understand empty constructors', () => {
            const def = class MyComponent {}
            assert.deepEqual(target.getComponentDef({ Ctor: def }), {
                name: 'MyComponent',
                props: {},
                attrs: {},
                methods: {},
                observedAttrs: {},
                observedProps: {},
            });
        });

    });
});

import { Element } from "../../html-element";
import { createElement } from "../../upgrade";
import wire from "../wire";

describe('wire.ts', () => {
    describe('@wire misuse', () => {
        it('should throw when invoking wire as a function', () => {
            class MyComponent extends Element {
                constructor() {
                    super();
                    wire();
                }
            }
            expect(() => {
                createElement('x-foo', { is: MyComponent });
            }).toThrow('@wire may only be used as a decorator.');
        });
    });
});

import { Element } from './../html-element';
import { createElement } from './../upgrade';
describe('Composed events', () => {
    it('should be able to consume events from within template', () => {
        let count = 0;
        class Child extends Element {
            triggerFoo() {
                this.dispatchEvent(new CustomEvent('foo'));
            }
        }
        Child.publicMethods = ['triggerFoo'];

        class ComposedEvents extends Element {
            triggerChildFoo() {
                this.root.querySelector('x-custom-event-child').triggerFoo();
            }
            handleFoo() {
                count += 1;
            }
            render() {
                return ($api, $cmp) => {
                    return [
                        $api.c('x-custom-event-child', Child, {
                            on: {
                                foo: $api.b($cmp.handleFoo),
                            },
                            key: 0,
                        }),
                    ];
                }
            }
        }

        ComposedEvents.publicMethods = ['triggerChildFoo'];

        const elem = createElement('x-components-events-parent', { is: ComposedEvents });
        document.body.appendChild(elem);
        elem.triggerChildFoo();
        expect(count).toBe(1);
    });
});

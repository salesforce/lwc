import foo_bar__default from 'foo/bar';

export default function template(context, renderer) {
    const { createComponent, connectComponent, disconnectComponent } = renderer;
    let foo_bar;
    return {
        create() {
            foo_bar = createComponent("foo-bar", foo_bar__default);
        },
        insert(target, anchor) {
            connectComponent(foo_bar, target);
        },
        update() {
            
        },
        detach() {
            disconnectComponent(foo_bar, target);
        }
    }
}
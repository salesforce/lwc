import foo_bar__default from 'foo/bar';

export default function template(context, renderer) {
    const { createElement, addListener, createComponent, insert, connectComponent, remove, disconnectComponent } = renderer;
    let div;
    let foo_bar;
    return {
        create() {
            div = createElement("div");
            addListener(div, "click", context.handleClick);
            foo_bar = createComponent("foo-bar", foo_bar__default);
            addListener(foo_bar, "click", context.handleClick);
        },
        insert(target, anchor) {
            insert(div, target);
            connectComponent(foo_bar, target);
        },
        update() {
            
        },
        detach() {
            remove(div, target);
            disconnectComponent(foo_bar, target);
        }
    }
}
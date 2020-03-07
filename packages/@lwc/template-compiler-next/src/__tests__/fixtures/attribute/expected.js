export default function template(context, renderer) {
    const { createElement, setAttribute, insert, remove } = renderer;
    let div;
    return {
        create() {
            div = createElement("div");
            setAttribute(div, "class", "foo bar");
            setAttribute(div, "style", "color: red;");
        },
        insert(target, anchor) {
            insert(div, target);
        },
        update() {
            
        },
        detach() {
            remove(div, target);
        }
    }
}
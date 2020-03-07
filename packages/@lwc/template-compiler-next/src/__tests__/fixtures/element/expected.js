export default function template(context, renderer) {
    const { createElement, createText, insert, remove } = renderer;
    let span;
    let text;
    return {
        create() {
            span = createElement("span");
            text = createText("test");
        },
        insert(target, anchor) {
            insert(span, target);
            insert(text, span);
        },
        update() {
            
        },
        detach() {
            remove(span, target);
        }
    }
}
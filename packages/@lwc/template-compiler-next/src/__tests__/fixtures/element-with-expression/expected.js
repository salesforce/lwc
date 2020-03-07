export default function template(context, renderer) {
    const { createElement, createText, insert, setText, remove } = renderer;
    let span;
    let text;
    let text_value = context.name;
    let text0;
    let text1;
    return {
        create() {
            span = createElement("span");
            text = createText("Hello ");
            text0 = createText(text_value);
            text1 = createText("!");
        },
        insert(target, anchor) {
            insert(span, target);
            insert(text, span);
            insert(text0, span);
            insert(text1, span);
        },
        update() {
            if (text_value !== (text_value = context.name)) {
                setText(text0, text_value);
            }
        },
        detach() {
            remove(span, target);
        }
    }
}
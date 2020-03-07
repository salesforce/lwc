export default function template(context, renderer) {
    const { createElement, setAttribute, insert, remove } = renderer;
    let div;
    let class_value = context.divClass;
    let style_value = context.divStyle;
    return {
        create() {
            div = createElement("div");
            setAttribute(div, "class", class_value);
            setAttribute(div, "style", style_value);
        },
        insert(target, anchor) {
            insert(div, target);
        },
        update() {
            if (class_value !== (class_value = context.divClass)) {
                setAttribute(div, "class", class_value);
            }
            if (style_value !== (style_value = context.divStyle)) {
                setAttribute(div, "style", style_value);
            }
        },
        detach() {
            remove(div, target);
        }
    }
}
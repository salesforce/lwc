export default function template(context, renderer) {
    const { createElement, setAttribute, insert, remove } = renderer;
    let svg;
    let circle;
    return {
        create() {
            svg = createElement("svg", "http://www.w3.org/2000/svg");
            circle = createElement("circle", "http://www.w3.org/2000/svg");
            setAttribute(circle, "cx", "50");
            setAttribute(circle, "cy", "50");
        },
        insert(target, anchor) {
            insert(svg, target);
            insert(circle, svg);
        },
        update() {
            
        },
        detach() {
            remove(svg, target);
        }
    }
}
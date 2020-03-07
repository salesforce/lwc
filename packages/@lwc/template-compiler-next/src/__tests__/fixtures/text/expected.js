export default function template(context, renderer) {
    const { createText, insert } = renderer;
    let text;
    return {
        create() {
            text = createText("Hello world!\n");
        },
        insert(target, anchor) {
            insert(text, target);
        },
        update() {
            
        },
        detach() {
            
        }
    }
}
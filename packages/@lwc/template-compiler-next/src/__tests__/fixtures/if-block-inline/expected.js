export default function template(context, renderer) {
    
    let if_block = context.isTrue && ifBlock(context);
    let if_block0 = !context.isFalse && ifBlock0(context);
    return {
        create() {
            if (if_block) {
                if_block.create();
            }
            if (if_block0) {
                if_block0.create();
            }
        },
        insert(target, anchor) {
            if (if_block) {
                if_block.insert(target);
            }
            if (if_block0) {
                if_block0.insert(target);
            }
        },
        update() {
            if (context.isTrue) {
                if (if_block) {
                    if_block.update();
                } else {
                    if_block = ifBlock(context);
                    if_block.create();
                    if_block.insert(target);
                }
            } else {
                if_block.detach();
                if_block = undefined;
            }
            if (!context.isFalse) {
                if (if_block0) {
                    if_block0.update();
                } else {
                    if_block0 = ifBlock0(context);
                    if_block0.create();
                    if_block0.insert(target);
                }
            } else {
                if_block0.detach();
                if_block0 = undefined;
            }
        },
        detach() {
            if (if_block) {
                if_block.detach();
            }
            if (if_block0) {
                if_block0.detach();
            }
        }
    }
}

function ifBlock(context, renderer) {
    const { createElement, createText, insert, remove } = renderer;
    let div;
    let text;
    return {
        create() {
            div = createElement("div");
            text = createText("I am true");
        },
        insert(target, anchor) {
            insert(div, target);
            insert(text, div);
        },
        update() {
            
        },
        detach() {
            remove(div, target);
        }
    }
}

function ifBlock0(context, renderer) {
    const { createElement, createText, insert, remove } = renderer;
    let div;
    let text;
    return {
        create() {
            div = createElement("div");
            text = createText("I am false");
        },
        insert(target, anchor) {
            insert(div, target);
            insert(text, div);
        },
        update() {
            
        },
        detach() {
            remove(div, target);
        }
    }
}
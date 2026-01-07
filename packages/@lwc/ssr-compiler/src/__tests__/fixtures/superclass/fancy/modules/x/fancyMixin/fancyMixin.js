export const FancyMixin = (clazz, value) =>
    class extends clazz {
        mixed = value;
        connectedCallback() {
            this.setAttribute('data-yolo', '');
        }
    };

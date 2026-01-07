export const FancyMixin = (Class) => {
    return class extends Class {
        connectedCallback() {
            this.setAttribute('data-yolo', '');
        }
    };
};

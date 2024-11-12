export const FancyMixin = clazz => class extends clazz {
    connectedCallback() {
        this.setAttribute('data-yolo', '')
    }
}

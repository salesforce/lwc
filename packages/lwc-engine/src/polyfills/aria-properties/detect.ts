export function detect(): boolean {
    return Object.getOwnPropertyDescriptor(Element.prototype, 'role') === undefined;
}

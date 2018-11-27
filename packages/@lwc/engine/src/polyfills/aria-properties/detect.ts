export function detect(propName: string): boolean {
    return Object.getOwnPropertyDescriptor(Element.prototype, propName) === undefined;
}

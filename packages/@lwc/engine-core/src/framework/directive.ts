export class Directive {
    renderedCallback(_elm: Node) {}

    disconnectedCallback() {}

    connectedCallback() {}
}

export const directives = new Map<string, Directive>();
export function registerDirective<T extends Directive>(name: string, ctor: T) {
    directives.set(`lwc:custom:${name}`, ctor);
}

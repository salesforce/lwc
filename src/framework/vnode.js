// @flow

// instances of this class will never be exposed to user-land
export default class vnode {

    constructor() {
        this.isMounted = false;
        this.domNode = null;
    }

    set(attrName: string, attrValue: any) {
        throw new ReferenceError('Abstract Method set() invoked.');
    }

    dispatch(name: string) {
        throw new ReferenceError('Abstract Method dispatch() invoked.');
    }

    toBeMounted() {
        this.isMounted = true;
    }

    toBeDismount() {
        this.isMounted = false;
    }

    toBeHydrated() {}

}

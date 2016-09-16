// @flow

import vnode from "./vnode.js";

export default class Facet extends vnode {

    constructor() {
        super();
        this.name = 'facet';
        this.domNode = document.createComment('facet');
    }

    toBeHydrated() {
        // nothing to be done here... :)
    }

}

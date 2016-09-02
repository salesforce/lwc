// @flow

import vnode from "./vnode.js";

export default class Facet extends vnode {

    constructor() {
        super();
        this.domNode = document.createComment('facet');
    }

}

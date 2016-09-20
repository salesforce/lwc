// @flow

import vnode from "./vnode.js";

export default class Facet extends vnode {

    static vnodeType = 'facet';

    constructor() {
        super();
        this.domNode = document.createComment('facet');
        this.isReady = true;
    }

}

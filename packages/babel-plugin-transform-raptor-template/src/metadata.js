/* 
* TBI
* This module is meant to collect all dependencies so we can surface it on the class
* NOTE @dval: 
* We need to guarantee all this methods are side-effect free
* since this module is only for collecting metadata dependencies
*/
import {types as t} from 'babel-core';

export default { 
    initialize(meta) {
        this.usedIds = {};
        meta.templateUsedIds = meta.templateUsedIds || [];
        meta.templateDependencies = meta.templateDependencies || [];
        this.metadata = meta;
    },
    addUsedId(node) {
        let name = t.isMemberExpression(node) ? node.object.name : node.name || node;

        if (typeof name !== 'string') {
            return;
        }

        const meta = this.metadata;
        if (!this.usedIds[name]) {
            this.usedIds[name] = true;
            meta.templateUsedIds.push(name);
        }
    },
    addComponentDependency(id) {
       this.metadata.templateDependencies.push(id);
    }
};
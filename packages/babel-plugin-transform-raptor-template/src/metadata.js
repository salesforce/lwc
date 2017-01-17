/* 
* TBI
* This module is meant to collect all dependencies so we can surface it on the class
* NOTE @dval: 
* We need to guarantee all this methods are side-effect free
* since this module is only for collecting metadata dependencies
*/
export function addDependency(node, state, t) {
    const meta = state.file.metadata;
    let name = t.isMemberExpression(node) ? node.object.name : node.name || node;
    if (typeof name !== 'string') {
        return;
    }

    meta.templateUsedIds = meta.templateUsedIds || {};
    meta.templateUsedIds[name] = meta.templateUsedIds[name] ? meta.templateUsedIds[name] + 1 : 1;
}
/* 
* TBI
* This module is meant to collect all dependencies so we can surface it on the class
* NOTE @dval: 
* We need to guarantee all this methods are side-effect free
* since this module is only for collecting metadata dependencies
*/
export function addDependency(node, state) {
    let name = node.name || node;
    
    if (typeof name !== 'string') {
        return;
    }    

    const meta = state.file.metadata;
    meta.usedIdentifiers = meta.usedIdentifiers || {};

    name = name.split(' ').pop();
    meta.usedIdentifiers[name] = meta.usedIdentifiers[name] ? meta.usedIdentifiers[name] + 1 : 1;
}
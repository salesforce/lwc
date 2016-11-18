/* 
* TBI
* This module is meant to collect all dependencies so we can surface it on the class
* NOTE @dval: 
* We need to guarantee all this methods are side-effect free
* since this module is only for collecting metadata dependencies
*/
function addExpression(expression) {
    console.log('Collecting metadata:addExpression', expression.name);
}

export default { addExpression };
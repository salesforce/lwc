const dispatchEvent = 'EventTarget' in window ?
    EventTarget.prototype.dispatchEvent :
    Node.prototype.dispatchEvent; // IE11

export {
    dispatchEvent,
};

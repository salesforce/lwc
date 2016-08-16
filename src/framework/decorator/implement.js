function isImplemented(target, intf) {
    if (!intf) {
        throw new Error(`Invalid interface definition [${intf}] provided via implement() decorator.`);
    }
    // TODO: figure how to test that `target` implements `intf`
    return true;
}

export default function implement(...interfaces) {
    return function decorator(target) {
        // this decorator is responsible for, during debug mode, guarantee that
        // all interfaces are correctly implemented by target
        if (interfaces.length === 0) {
            throw new Error('At least one argument should be provided when using the implement() decorator.');
        }
        for (let intf of interfaces) {
            if (!isImplemented(target, intf)) {
                throw new Error(`[${target}] does not implement interface [${intf}].`);
            }
        }
    }
}

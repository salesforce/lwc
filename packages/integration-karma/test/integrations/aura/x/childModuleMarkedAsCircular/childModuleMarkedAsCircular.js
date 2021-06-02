import { LightningElement } from 'lwc';

class ChildModuleMarkedAsCircular extends LightningElement {}

export default function tmp() {
    return {
        default: ChildModuleMarkedAsCircular,
        __esModule: true,
    };
}
tmp.__circular__ = true;

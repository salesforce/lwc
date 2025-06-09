import { LightningElement, api } from 'lwc';

export default class ValueNotFunction extends LightningElement {
    @api handlerType;

    get eventHandlers() {
        switch (this.handlerType) {
            case 'getter that throws':
                return {
                    get click() {
                        throw new Error('some error');
                    },
                };
            case 'LightningElement instance':
                return new (class extends LightningElement {})();
            default:
                return {};
        }
    }
}

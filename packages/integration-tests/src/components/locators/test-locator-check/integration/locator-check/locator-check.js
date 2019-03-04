import { LightningElement, register } from 'lwc';

export default class LocatorCheck extends LightningElement {
    serviceRegistered = false;
    connectedCallback() {
        if (!this.serviceRegistered) {
            register({
                locator: function(component, data, def, context) {
                    const { target, host, targetContext, hostContext } = context.locator.resolved;
                    window.interaction = {
                        target: target,
                        scope: host,
                        context: Object.assign(targetContext || {}, hostContext),
                    };
                },
            });
            this.serviceRegistered = true;
        }
    }

    containerParentContext() {
        return {
            'container-parent': LocatorCheck.state,
        };
    }
}
LocatorCheck.state = 'from-locator-check-1';

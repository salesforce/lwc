
import { LightningElement, register } from 'lwc';

export default class LocatorCheck extends LightningElement {

    serviceRegistered = false;
    connectedCallback() {
        if (!this.serviceRegistered) {
            register({
                located: function(component, data, def, context) {
                    const {target, host, targetContext, hostContext} = context.locator.resolved;
                    const interaction = {
                        target: target,
                        scope:  host,
                        context: Object.assign(targetContext || {}, hostContext)
                    };
                    console.log("interaction", interaction);
                }
            });
            this.serviceRegistered = true;
        }

        document.addEventListener("LWCLocator", function(e) {
            /*
                // LWCLocator Event detail field
                {
                    target,
                    host,
                    key: "__$$locator"
                }
            */
            var locatorDetail = e.detail;
            var target = locatorDetail.target;
            var host = locatorDetail.host;
            var lookupKey = locatorDetail.key;

            var rootLocator = target && target[lookupKey]();
            var parentLocator = host && host[lookupKey]();

            if (rootLocator)  {
                if (parentLocator) {
                    let locator = {
                        "target": rootLocator.id,
                        "scope": parentLocator.id,
                        "context": Object.assign(rootLocator["context"], parentLocator["context"])
                    }
                    console.log(locator);
                } else {
                    console.log("No locator on target element", host);
                }
            } else {
                console.log("No locator on host", target);
            }
        })
    }

    containerParentContext() {
        return {
            "container-parent": LocatorCheck.state
        }
    }
}
LocatorCheck.state = "from-locator-check-1";

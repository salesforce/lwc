import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
<<<<<<< HEAD:packages/@lwc/integration-karma/test/component/lifecycle-callbacks/reordering/list/list.js
    @api uids = [];
=======
    mount = 'loaded on mount';
    mountClassName = 'class_name_loaded_on_mount';

    @api
    update;

    @api
    updateClassName;
>>>>>>> b9d80ed23 (test: karma tests):packages/@lwc/integration-karma/test/static-content/x/attributeExpression/attributeExpression.js
}

import { LightningElement, api } from 'lwc';
import templateWithChild from './withChild.html';
import emptyTemplate from './empty.html';

export default class Test extends LightningElement {
    template = templateWithChild;
    @api renderCount = 0;

    renderedCallback() {
        this.renderCount++;
    }

    // The template is switched, which disconnects the child component and schedules this component for rehydration.
    // A bug (W-19830319) has shown that if child component properties are incorrectly marked for observation by the lifecycle, they can trigger the parent component to re-render
    // and this will cause undesired effects. This bug manifested due to context connection/disconnection, but it could theoretically occur in any instance where
    // the "live" component property is accessed instead of via vm.cmpFields / vm.cmpProps.
    @api switchToEmptyTemplate() {
        this.template = emptyTemplate;
    }

    // The switch is done explicitly with a template, marking this component as dirty.
    render() {
        return this.template;
    }
}

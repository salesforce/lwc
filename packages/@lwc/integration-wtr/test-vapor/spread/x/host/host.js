import { LightningElement, api } from 'lwc';
export default class Host extends LightningElement {
    @api spanProps = { title: 'hi', 'data-x': '1' };
}

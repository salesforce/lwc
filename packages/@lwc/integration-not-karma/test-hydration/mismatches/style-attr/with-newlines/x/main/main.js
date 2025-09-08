import { LightningElement } from 'lwc';

export default class Main extends LightningElement {
    get customStyles() {
        return `
      color: blue;
      margin: 16px;
    `;
    }
}

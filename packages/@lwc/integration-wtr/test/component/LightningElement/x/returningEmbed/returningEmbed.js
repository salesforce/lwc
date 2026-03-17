import { LightningElement } from 'lwc';

export default class ReturningEmbed extends LightningElement {
    constructor() {
        super();
        const embed = document.createElement('embed');
        LightningElement.call(embed);
        return embed;
    }
}

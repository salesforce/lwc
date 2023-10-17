import { LightningElement, api } from 'lwc';

export default class App extends LightningElement {
    @api counter = 0;

    one() {
        this.counter++;
    }

    un: {
        deux: () => {
            this.counter++;
        },
    };

    uno = ((component) => ({
        dos: {
            tres() {
                component.counter++;
            },
        },
    }))(this);

    ichi = ((component) => ({
        ni: {
            san: {
                yon() {
                    component.counter++;
                },
            },
        },
    }))(this);
}

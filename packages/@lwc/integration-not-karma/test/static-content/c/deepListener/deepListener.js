import { LightningElement, api } from 'lwc';

export default class App extends LightningElement {
    @api counter = 0;

    one() {
        this.counter++;
    }

    un = {
        deux: () => {
            this.counter++;
        },
    };

    uno = {
        dos: {
            tres: () => {
                this.counter++;
            },
        },
    };

    ichi = {
        ni: {
            san: {
                shi: () => {
                    this.counter++;
                },
            },
        },
    };
}

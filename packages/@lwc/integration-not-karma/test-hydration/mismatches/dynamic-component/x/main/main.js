import { LightningElement, api } from 'lwc';
import ServerCtor from 'x/server';
import ClientCtor from 'x/client';

const ctors = {
    server: ServerCtor,
    client: ClientCtor,
};

export default class Main extends LightningElement {
    #ctor;

    @api
    set ctor(name) {
        this.#ctor = ctors[name];
    }

    get ctor() {
        return this.#ctor;
    }
}

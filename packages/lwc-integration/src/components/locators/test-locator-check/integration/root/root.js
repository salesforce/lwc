
import { LightningElement, track } from 'lwc';

export default class Root extends LightningElement {

    stateVar1 = "from-root-1";
    stateVar2 = "from-root-2";

    state = {
        todos: [{   id: 1, text: "Todo Item 1",
                    clickHandler: (e) => window.clicked=true },
                {   id: 2, text: "Todo Item 2",
                    clickHandler: (e) => window.clicked=true }]
    }

    stateBar = {
        foo: 10,
        handleClickInBar: function(e) {
            window.clicked = true;
        }
    }

    handleClick(e) {
        window.clicked = true;
    }

    rootContext() {
        return {
            "key-foo": this.stateVar2
        };
    }

    todoContext() {
        return {
            "key-root": this.stateVar1,
            "key-common": this.stateVar2
        };
    }
}



import { LightningElement } from 'lwc';

export default class Root extends LightningElement {

    stateVar1 = "from-root-1";
    stateVar2 = "from-root-2";
    state = {
        todos: [{   id: 1, text: "Todo Item 1",
                    clickHandler: (e) => console.log("click 1", e) },
                {   id: 2, text: "Todo Item 2",
                    clickHandler: (e) => console.log("click 2", e) }]
    }

    stateBar = {
        foo: 10,
        handleClickInBar: function(e) {
            console.log(this, e);
        }
    }

    handleClick(e) {
        console.log("Hey There was a click", e);
    }

    rootContext() {
        throw new Error("Root");
    }

    todoContext() {
        return {
            "key-root": this.stateVar1,
            "key-common": this.stateVar2
        }
    }
}


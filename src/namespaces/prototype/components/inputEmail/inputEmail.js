
export default class InputEmail {
    constructor() {}

    placeholder = 'default';
    value;
    onChange;

    onChangeHandler (e) {
        if (this.onChange) {
            this.onChange(e);
        }
    }
}
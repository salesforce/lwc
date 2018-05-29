import { Element, track } from 'engine';

export default class LightningCheckboxGroup extends Element {
    @track options = [{ value: 'a' }, { value: 'b' }];
    @track value = [];

    @track _deffered = [];

    get transformedOptions() {
        const { options, value } = this;
        const ret = options.map(option => ({
            value: option.value,
            isChecked: value.indexOf(option.value) !== -1
        }));
        return ret;
    }

    handleChange(event) {
        const checkboxes = this.root.querySelectorAll('input');
        const value = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
        this._deffered = value;
    }

    test() {
        this.value = this._deffered = this._deffered.filter(i => i !== 'a');
    }
}

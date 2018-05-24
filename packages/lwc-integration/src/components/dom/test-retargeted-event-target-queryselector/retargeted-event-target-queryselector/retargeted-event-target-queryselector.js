import { Element } from 'engine';


export default class LightdomQuerySelector extends Element {
    handleClick(evt) {
        const div = evt.currentTarget.querySelector('div');
        div.setAttribute('data-selected', 'true');
    }
}

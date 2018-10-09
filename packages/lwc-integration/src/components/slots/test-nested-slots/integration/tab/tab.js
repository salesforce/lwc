import LightningTab from 'integration/fulltab';
import tmpl from './tab.html';

export default class FlexipageTab2 extends LightningTab {
    _internalLabel;

    render() {
        return tmpl;
    }
}

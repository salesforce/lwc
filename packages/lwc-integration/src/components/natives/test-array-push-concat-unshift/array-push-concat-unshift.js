import { Element, track } from 'engine';


export default class Issue763 extends Element {
    @track items = [{
        title: 'first'
    }, {
        title: 'second'
    }]

    @track pushItems = [{
        title: 'first'
    }, {
        title: 'second'
    }]

    @track concatItems = [{
        title: 'first'
    }, {
        title: 'second'
    }];

    handleClick() {
        this.items.unshift({
            title: 'unshifted'
        });
    }

    handlePushClick() {
        this.pushItems.push({
            title: 'pushed'
        });
    }

    handleConcatClick() {
        this.concatItems = this.concatItems.concat([{
            title: 'concat 1'
        }, {
            title: 'concat 2'
        }]);
    }
}
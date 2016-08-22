import sValue from './helpers/some.js';

export default class Bar {
    get c() {
        return this.a + this.b;
    }
    constructor(attrs) {
        this.a = attrs.a;
        this.b = attrs.b;
    }
    onClick() {
        console.log('clicked');
    }
    render(api) {
        return api.createElement('button', {
            name: 'mybutton',
            onClick: (e) => this.onClick(e)
        }, [
            api.createElement('span', {}, ['something'])
        ]);
    }
}

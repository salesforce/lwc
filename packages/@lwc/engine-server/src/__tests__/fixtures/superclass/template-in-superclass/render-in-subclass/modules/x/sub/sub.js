import Super from 'x/super';
import template from './template.html';

export default class extends Super {
    name = 'world';

    render() {
        return template;
    }
}

import Super from 'x/super';
import stylesheet from './stylesheet.css';

export default class extends Super {
    static stylesheets = [...super.stylesheets, stylesheet];
}

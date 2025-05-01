import { parentContextFactory } from 'x/parentContext';
import Base from 'x/base';

export default class TooMuchContext extends Base {
    context = parentContextFactory('parent provided value');
    tooMuch = parentContextFactory('this world is not big enough for me');
}

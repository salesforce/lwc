class Base {}

class NotExported extends Base {
    static value = 'ook ook ook';
}

export default class {
    method() {
        return NotExported.value;
    }
}

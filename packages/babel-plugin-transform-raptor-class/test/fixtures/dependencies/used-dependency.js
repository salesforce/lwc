import dep from 'external-lib';

export default class Test {
    test = 1;
    constructor() {}
    test() {
        dep();
    }
}

export default class Test {
    @wire('record', '$recordId', ['Account', 'Rate']) innerRecord;
}

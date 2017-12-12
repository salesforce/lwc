import { Element } from 'engine';
import externalDep from 'another-module';

export default class Foo extends Element {
    anotherModule = externalDep;

    static labels = [
        'test-label'
    ]
}

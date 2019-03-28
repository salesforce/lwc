import { LightningElement } from "lwc";
function x(test: string): string {
    return test + "!";
}
export default class ClassAndTemplate extends LightningElement {
    foo(test: string) {
        return x(test);
    }
}

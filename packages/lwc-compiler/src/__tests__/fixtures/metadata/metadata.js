import { LightningElement, api, wire } from "lwc";
import { getTodo } from "todo";
import { getHello } from "@schema/foo.bar";

export default class Metadata extends LightningElement {
    @api
    publicProp;

    @api
    publicMethod(name) {
        return "hello" + name;
    }

    @wire(getTodo, {})
    wiredProp;

    @wire(getHello, { name: '$publicProp', fields: ['one', 'two'] })
    wiredMethod(result) {
    }
}

export const HELLOWORLD = "hello world!";
export function ohai(name) {
    return "ohai, " + name;
};

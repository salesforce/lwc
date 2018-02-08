import { createTrackedPropertyDescriptor } from "./track";
import assert from "../assert";

// stub function to prevent misuse of the @wire decorator
export default function wire() {
    if (process.env.NODE_ENV !== 'production') {
        assert.fail("@wire may only be used as a decorator.");
    }
}
// TODO: how to allow symbols as property keys?
export function createWiredPropertyDescriptor(proto: object, key: string, descriptor: PropertyDescriptor | undefined) {
    createTrackedPropertyDescriptor(proto, key, descriptor);
}

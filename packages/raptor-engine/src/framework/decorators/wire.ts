import { createTrackedPropertyDescriptor } from "./track";

// TODO: how to allow symbols as property keys?
export function createWiredPropertyDescriptor(proto: object, key: string, descriptor: PropertyDescriptor) {
    createTrackedPropertyDescriptor(proto, key, descriptor);
}

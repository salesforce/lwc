export default function detect(): boolean {
    return Object.getOwnPropertyDescriptor(Event.prototype, 'composed') === undefined;
}

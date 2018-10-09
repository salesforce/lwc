export default function detect(): boolean {
    return typeof (window as any).ShadowRoot === 'undefined'
}

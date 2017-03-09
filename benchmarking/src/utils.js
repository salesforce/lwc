/** Assert presence of of an HTMLElement matching a querySelector */
export function assertElement(selector) {
    const node = document.querySelector(selector);

    if (!node) {
        throw new Error(`Not element matching ${selector}`);
    }
}

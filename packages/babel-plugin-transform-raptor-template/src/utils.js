export function makeMap (str) {
    const map = Object.create(null);
    const list = str.split(',');

    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true;
    }
    return (val) => map[val];
}
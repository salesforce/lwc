export function kebabcaseToCamelcase(name) {
    const newName: string[] = [];
    let nsFound = false;
    let upper = false;
    for (let i = 0; i < name.length; i++) {
        if (name[i] === '-') {
            if (!nsFound) {
                nsFound = true;
                newName.push('/');
            } else {
                upper = true;
            }
        } else {
            newName.push(upper ? name[i].toUpperCase() : name[i]);
            upper = false;
        }
    }
    return newName.join('');
}

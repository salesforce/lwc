export function componentNameToModuleSpecifier(componentName: string): string {
    const [ns, ...rest] = componentName.split('-');
    const name = rest.map((entry, index) =>
        index === 0 ? entry : `${entry.charAt(0).toUpperCase()}${entry.slice(1)}`
    );

    return `${ns}/${name}`;
}

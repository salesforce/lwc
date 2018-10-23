const templateRegex = /\{([0-9]+)\}/g;
export function templateString(template: string, args: any[]) {
    return template.replace(templateRegex, (_, index) => {
        return args[index];
    });
}

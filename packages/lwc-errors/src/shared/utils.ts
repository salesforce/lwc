export interface LWCErrorInfo {
    code: number;
    message: string;
    type: string;
    level: string;
    arguments?: any[];
    url?: string;
}

const templateRegex = /\{([0-9]+)\}/g;
export function templateString(template: string, args: any[]) {
    return template.replace(templateRegex, (_, index) => {
        return args[index];
    });
}

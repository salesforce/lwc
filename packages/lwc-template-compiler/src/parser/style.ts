import * as parseCSS from 'css-parse';
import * as toCamelCase from 'camelcase';

const NOT_SUPPORTED = ['display'];

const DIRECTIONS = ['top', 'right', 'bottom', 'left'];
const CHANGE_ARR = ['margin', 'padding', 'border-width', 'border-radius'];

const NUMBERIZE = ['width', 'height', 'font-size', 'line-height'].concat(DIRECTIONS);
DIRECTIONS.forEach((dir) => {
    NUMBERIZE.push(`border-${dir}-width`);
    CHANGE_ARR.forEach((prop) => {
        NUMBERIZE.push(`${prop}-${dir}`);
    });
});

// Special properties and shorthands that need to be broken down separately
const SPECIAL_PROPS: { [name: string]: { regex: RegExp, map: { [key: number]: string | null } } } = {};
['border', 'border-top', 'border-right', 'border-bottom', 'border-left'].forEach((name) => {
    SPECIAL_PROPS[name] = {
        /* uncomment to remove `px` */
        // regex: /^\s*([0-9]+)(px)?\s+(solid|dotted|dashed)?\s*([a-z0-9#,\(\)\.\s]+)\s*$/i,
        regex: /^\s*([0-9]+px?)\s+(solid|dotted|dashed)?\s*([a-z0-9#,\(\)\.\s]+)\s*$/i,
        map: {
            1: `${name}-width`,
            3: name === 'border' ? `${name}-style` : null,
            4: `${name}-color`,
        },
    };
});

// Map of properties that when expanded use different directions than the default Top,Right,Bottom,Left.
const DIRECTION_MAPS: { [name: string]: { [direction: string]: string } } = {
    'border-radius': {
        Top: 'top-left',
        Right: 'top-right',
        Bottom: 'bottom-right',
        Left: 'bottom-left',
    },
};

function clean(value: string): string {
    return value.replace(/\r?\n|\r/g, '');
}

// Convert the shorthand property to the individual directions, handles edge cases.
// i.e. border-width and border-radius
function directionToPropertyName(property: string, direction: string): string {
    const names = property.split('-');
    names.splice(1, 0, DIRECTION_MAPS[property] ? DIRECTION_MAPS[property][direction] : direction);
    return toCamelCase(names.join('-'));
}

// FIXME: This function is crap and need to be better tested
function parse(styleString: string): any {
    const stylesheetString = `body { ${styleString} }`;

    const { stylesheet } = parseCSS(clean(stylesheetString));

    const JSONResult: any = {};

    for (const rule of stylesheet.rules) {
        if (rule.type !== 'rule') {
            continue;
        }

        for (let selector of rule.selectors) {
            selector = selector.replace(/\.|#/g, '');
            const styles = (JSONResult[selector] = JSONResult[selector] || {});

            for (const declaration of rule.declarations) {
                if (declaration.type !== 'declaration') {
                    continue;
                }

                const { value, property } = declaration;

                if (SPECIAL_PROPS[property]) {
                    const special:any = SPECIAL_PROPS[property];
                    const matches = special.regex.exec(value as string);
                    if (matches) {
                        if (typeof special.map === 'function') {
                            special.map(matches, styles, rule.declarations);
                        } else {
                            for (const key in special.map) {
                                if (matches[key] && special.map[key]) {
                                    rule.declarations.push({
                                        position: declaration.position,
                                        parent: rule,
                                        property: special.map[key] || '',
                                        value: matches[key],
                                        type: 'declaration',
                                    });
                                }
                            }
                        }
                        continue;
                    }
                }

                if (NOT_SUPPORTED.includes(property)) {
                    continue;
                }

                if (NUMBERIZE.includes(property)) {
                    // uncomment to remove `px`
                    // value = value.replace(/px|\s*/g, '');
                    styles[toCamelCase(property)] = /*parseFloat(value);*/ value; /* uncomment to remove `px` */
                } else if (CHANGE_ARR.includes(property)) {
                    const values = (value as string)/*.replace(/px/g, '')*/.split(/[\s,]+/);

                    /* uncomment to remove `px` */
                    // values.forEach((value, index, arr) => {
                    //     arr[index] = parseInt(value);
                    // });

                    const length = values.length;

                    if (length === 1) {
                        styles[toCamelCase(property)] = values[0];
                    }

                    if (length === 2) {
                        for (const prop of ['Top', 'Bottom']) {
                            styles[directionToPropertyName(property, prop)] = values[0];
                        }

                        for (const prop of ['Left', 'Right']) {
                            styles[directionToPropertyName(property, prop)] = values[1];
                        }
                    }

                    if (length === 3) {

                        for (const prop of ['Left', 'Right']) {
                            styles[directionToPropertyName(property, prop)] = values[1];
                        }

                        styles[directionToPropertyName(property, 'Top')] = values[0];
                        styles[directionToPropertyName(property, 'Bottom')] = values[2];
                    }

                    if (length === 4) {
                        ['Top', 'Right', 'Bottom', 'Left'].forEach((prop, index) => {
                            styles[directionToPropertyName(property, prop)] = values[index];
                        });
                    }
                } else {
                    const shouldParseFloat = (typeof declaration.value === 'number' && !isNaN(declaration.value))
                        && property !== 'font-weight';
                    if (shouldParseFloat) {
                        declaration.value = parseFloat(declaration.value as string);
                    }

                    styles[toCamelCase(property)] = declaration.value;
                }
            }
        }
    }

    return JSONResult.body;
}

export function parseStyle(style: string): { [name: string]: string } {
    return parse(style);
}

export function parseClassNames(classNames: string): { [name: string]: true } {
    const splitted = classNames.trim()
        .split(/\s+/)
        .filter((className) => className.length);

    const classObj: { [name: string]: true } = {};
    for (const className of splitted) {
        classObj[className] = true;
    }
    return classObj;
}

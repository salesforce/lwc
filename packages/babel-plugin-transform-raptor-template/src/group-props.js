import ParserCSS from './style-parser';
import {makeMap} from './utils';

const isTopLevel = makeMap('class,staticClass,style,key,ref,slot');
const css = new ParserCSS();

export default function groupProps(props, t) {
    const newProps = [];
    const currentNestedObjects = {};
    let statementReference;

    props.forEach((prop) => {
        let name = prop.key.value || prop.key.name;
        if (isTopLevel(name)) { // top-level special props
            // Parse style
            if (name === 'style') {
                const objStyle = css.parse(prop.value.value);
                prop.value = t.valueToNode(objStyle);
            }
            
            newProps.push(prop);
        } else {
            // directives (for now is aura)
            const prefixIndex = name.indexOf('-');
            const prefix = prefixIndex > 0 && name.slice(0, prefixIndex);

            if (prefix === 'aura') {
                name = name.slice(prefixIndex + 1);
                let statement = currentNestedObjects.statement;

                if (!statement) {
                    statement = currentNestedObjects.statement = t.objectProperty(
                        t.identifier('statement'),
                        t.identifier(name)
                     );

                    // Save reference for later processing
                    statementReference = { type: name, value: prop.value };
                }
            } else {
                // Rest are nested under attrs/props
                let attrs = currentNestedObjects.attrs;
                if (!attrs) {
                    attrs = currentNestedObjects.attrs = t.objectProperty(
                        t.identifier('attrs'),
                        t.objectExpression([prop])
                    );
                    newProps.push(attrs);
                } else {
                    attrs.value.properties.push(prop);
                }
            }
        }
    });

    const objExpression = t.objectExpression(newProps);
    objExpression._statementReference = statementReference;

    return objExpression;
}
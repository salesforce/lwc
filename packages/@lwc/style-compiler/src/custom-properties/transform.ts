import { Root, Result } from 'postcss';
import parseValue from 'postcss-value-parser';
import { varFunctionMessage } from '../utils/message';

export default function process(root: Root, result: Result) {
    root.walkDecls(decl => {
        const valueRoot = parseValue(decl.value);
        let varFound = false;
        valueRoot.walk(({ type, value }) => {
            if (!varFound && type === 'function' && value === 'var') {
                // Add the imported to results messages
                const message = varFunctionMessage(value);
                result.messages.push(message);
                varFound = true;
            }
        });
    });
}

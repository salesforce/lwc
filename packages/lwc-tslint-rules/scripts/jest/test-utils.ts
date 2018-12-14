import { Configuration, Linter, LintResult } from 'tslint';
import { resolve } from 'path';

export const runLintRule = ({src, rule}): LintResult => {
    const linter = new Linter({fix: false});
    linter.lint('', src, Configuration.parseConfigFile({
        rules: {
            [rule.name || rule]: [true]
        },
        rulesDirectory: resolve(__dirname, '../../dist'),
    }));
    return linter.getResult();
};

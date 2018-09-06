import { PostCSSRuleNode } from "postcss-selector-parser";

export default function(rule: PostCSSRuleNode) {
    const result = /(#\w+)/.exec(rule.selector);
    if (result) {
        throw rule.error(
            `Invalid usage of id selector "${result[1]}". Use a class selector instead.`
        );
    }
}

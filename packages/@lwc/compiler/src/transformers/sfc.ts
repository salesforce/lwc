import * as path from 'path';
import { parse, SFCStyleBlock } from '@vue/compiler-sfc';

import { NormalizedTransformOptions } from '../options';
import { TransformResult } from './transformer';
import styleTransformer from './style';
import templateTransformer from './template';
import scriptTransformer from './javascript';

export default function sfcTransform(
    code: string,
    filename: string,
    options: NormalizedTransformOptions
): TransformResult {
    const { template, styles, script } = parse(code).descriptor;

    const templateContent =
        addRootTemplateAttrs(template?.attrs) + template!.content.trim() + '</template>';

    const fileNameObject = path.parse(filename);
    const templateFilename = path.format({ ...fileNameObject, ext: '.html', base: '' });
    const stylesFilename = path.format({ ...fileNameObject, ext: '.css', base: '' });
    const scriptFilename = path.format({ ...fileNameObject, ext: '.js', base: '' });
    // console.log('in sfcTransform');
    // console.log(templateFilename);
    // console.log(stylesFilename);
    // console.log(scriptFilename+'\n\n');

    options.isSFC = true;

    const templateResult = templateTransformer(templateContent, templateFilename, options);

    let stylesResult = '';
    const stylesStringArray = getStyles(styles);
    if (stylesStringArray[0]) {
        stylesResult += styleTransformer(stylesStringArray[0], stylesFilename, options).code + '\n';
    }
    if (stylesStringArray[1]) {
        const scopedOptions: NormalizedTransformOptions = { ...options, scopedStyles: true };
        stylesResult +=
            styleTransformer(stylesStringArray[1], stylesFilename, scopedOptions).code + '\n';
    } else {
        stylesResult += 'const _implicitScopedStylesheets = undefined;' + '\n';
    }

    const scriptResult = scriptTransformer(script!.content.trim(), scriptFilename, options);

    let finalCode = stylesResult + '\n' + templateResult.code + '\n' + scriptResult.code;

    const regex = new RegExp(`import _tmpl from "./(.*).html";`);
    finalCode = finalCode.replace(regex, '');

    // console.log(finalCode);
    return {
        code: finalCode,
        map: null,
    };
}

function addRootTemplateAttrs(attrs: Record<string, string | true> | undefined): string {
    if (!attrs) {
        return '<template>';
    }
    let attrsString = '';
    for (const attr in attrs) {
        if (typeof attrs[attr] == 'boolean') {
            attrsString += attr + ' ';
        } else {
            attrsString += attr + '=' + attrs[attr] + ' ';
        }
    }
    return `<template ${attrsString}>`;
}

function getStyles(styles: SFCStyleBlock[]): string[] {
    const result = ['', ''];
    if (styles.length > 0) {
        for (const style of styles) {
            if (style.attrs && style.attrs['scoped']) {
                result[1] = style.content.trim();
            } else {
                result[0] = style.content.trim();
            }
        }
    }
    return result;
}

import { DefaultTreeAdapterMap, ParserOptions } from 'parse5';
import * as token from 'parse5/dist/common/token';
import * as errorCodes from 'parse5/dist/common/error-codes';

export type Document = DefaultTreeAdapterMap['document'];
export type Node = DefaultTreeAdapterMap['node'];
export type Element = DefaultTreeAdapterMap['element'];
export type CommentNode = DefaultTreeAdapterMap['commentNode'];
export type TextNode = DefaultTreeAdapterMap['textNode'];
export type ElementLocation = token.ElementLocation;
export type Location = token.Location;
export type DocumentFragment = DefaultTreeAdapterMap['documentFragment'];
export type ParserError = errorCodes.ParserError;
export type Attribute = token.Attribute;
export type { ParserOptions };

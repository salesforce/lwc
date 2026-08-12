import { LightningElement } from 'lwc';

// A static SVG child under a non-static parent (the for:each) compiles to a `parseSVGFragment` /
// `$api.st` call. Unlike the plain `parseFragment` path, `parseSVGFragment` wraps the authored
// markup in `<svg>...</svg>` before it reaches the host-realm `<template>.innerHTML` sink, so it
// exercises the SVG-namespace branch of the sanitization gate under test (W-23814957).
export default class StaticSvgFragment extends LightningElement {
    items = [{ key: 'a' }];
}

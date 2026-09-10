import { LightningElement } from 'lwc';

// A purely static template (no dynamic bindings) compiles to a `parseFragment` call. The authored
// `href="javascript:0"` is baked verbatim into that static-fragment string and reaches
// `<template>.innerHTML` with no compile-time sanitization — the markup the sanitization gate under
// test (W-23814957) exists to give a consumer's `sanitizeHtmlContent` hook a chance to neutralize.
export default class UnsafeFragment extends LightningElement {}

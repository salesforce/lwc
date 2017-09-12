/**
 * This code runs before each test in compat mode.
 * We make sure to override the global Proxy object with a compat version of it.
 * The babel-transform will extract the `*Key` APIs the global Proxy object.
 */
global.Proxy = window.Proxy = require('proxy-compat');

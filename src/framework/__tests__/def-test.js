/* globals describe, beforeEach, it, require, jest, expect */

'use strict';

describe('getComponentDef', () => {
    var getComponentDef;

    beforeEach(() => {
        jest.resetModuleRegistry();
        getComponentDef = require('../def.js').getComponentDef;
    });

    it('should understand empty constructors', () => {
        class Ctor {} 
        var def = getComponentDef({ Ctor });
        expect(def).toBeDefined();
    });

});

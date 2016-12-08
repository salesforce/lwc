import expect from 'expect';
import { getComponentDef } from "../def.js";

describe('getComponentDef', () => {

    it('should understand empty constructors', () => {
        class Ctor {} 
        var def = getComponentDef({ Ctor });
        expect(def).toExist();
    });

});

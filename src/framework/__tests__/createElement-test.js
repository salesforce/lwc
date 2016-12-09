import * as target from '../createElement.js';
import sinon from 'sinon'
import * as api from '../api.js';
import assert from 'power-assert';

describe('createElement.js', function () {
    describe('#createElement()', function () {
        it('calls h when passed a string', function () {
            var stub = sinon.stub(api, "h");
            target("foo");
            assert(stub.calledWith("foo") === true);
        });

        it('calls v when passed a non-string', function () {
            var stub = sinon.stub(api, "v");
            target({});
            assert(stub.calledWith({}) === true);
        });
    });
});

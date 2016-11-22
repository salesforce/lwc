import flowRemoveTypes from 'flow-remove-types';

export default function (options = {}) {
    return {
        name: 'flow-remove-types',
        transform: function (code) {
            return {
                code: flowRemoveTypes(code, options),
                map: { mappings: '' }
            };
        }
    }
}
/*global module,require*/

(function index(module, require) {
    "use strict";

    var _m = {
            reader: require('./src/reader')
        },

        _parseArgs = function _parseArgs(args) {
            var _options = {
                path: args[0],
                goreDeg: args[1] || 5,
                isTransparentGrayscale: false
            };

            if(!_options.path) {
                throw new Error('No PNG file specified.');
            }

            return _options;
        };

    module.exports = function _index(args) {
        _m.reader(_parseArgs(args));
    };

})(module, require);
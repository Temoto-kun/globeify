/*global module,require*/

(function index(module, require) {
    "use strict";

    var _m = {
            reader: require('./src/reader')
        },

        _parseArgs = function _parseArgs(args) {
            var _options = {
                path: args[0],
                goreDeg: args[1],
                isTransparentGrayscale: args.indexOf('-G') !== -1 || args.indexOf('--grayscale-mask') !== -1
            };

            if(!_options.path) {
                throw new Error('No PNG file specified.');
            }

            if(!_options.goreDeg) {
                _options.goreDeg = 5;
            }

            if(isNaN(_options.goreDeg) || (360 % _options.goreDeg !== 0)) {
                throw new Error('Gore degree must be a number that can divide 360 to an integer value.');
            }

            return _options;
        };

    module.exports = function _index(args) {
        _m.reader(_parseArgs(args));
    };

})(module, require);
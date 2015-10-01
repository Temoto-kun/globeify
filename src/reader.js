/*global module,require,Math*/

(function reader(module, require, Math) {
    "use strict";

    var _m = {
            fs: require('fs'),
            path: require('path'),
            pngjs: require('pngjs'),
            progressStream: require('progress-stream')
        },
        _options,
        _rectToSinusoidal = function _rectToSinusoidal(width, height, goreDeg, x, y) {
            var _yRatio = y / height,
                _sin = Math.sin(_yRatio * Math.PI),
                _goreCount = 360 / goreDeg,
                _goreWidth = width / _goreCount,
                _goreHalf = _goreWidth / 2,
                _goreIndex = Math.floor(x / _goreWidth),
                _goreOffset = _goreIndex * _goreWidth,
                _goreCenter = _goreOffset + _goreHalf,
                _goreStart = _goreCenter - _sin * _goreHalf,
                _goreEnd = _goreCenter + _sin * _goreHalf,
                _goreStartOffset = x % _goreWidth / _goreWidth,
                _x = _goreStart + ((_goreEnd - _goreStart) * _goreStartOffset);

            return {
                x: _x,
                y: y
            };
        },
        _getIndex = function(width, x, y) {
            return (width * y + x) << 2;
        };

    module.exports = function _reader(options) {
        _options = options;
        var _progressStream = _m.progressStream({ time: 250 }),
            _inPath = _m.path.normalize(_options.path),
            _parsedPath = _m.path.parse(_inPath),
            _outPath = _m.path.normalize(_parsedPath.dir + '/' + _parsedPath.name + '.out' + _parsedPath.ext);

        _progressStream.on('progress', function(progress) {
            console.log(progress.percentage + '% complete');
        });

        _m.fs.createReadStream(_inPath)
            .pipe(new _m.pngjs.PNG())
            .on('parsed', function() {
                var _srcPng = this,
                    _width = _srcPng.width,
                    _height = _srcPng.height,
                    _png = new _m.pngjs.PNG({ width: _width, height: _height });

                for (var y = 0; y < _height; y++) {
                    for (var x = 0; x < _width; x++) {
                        var
                            _project = _rectToSinusoidal(_width, _height, _options.goreDeg, x, y),
                            _srcIdx = _getIndex(_width, x, y),
                            _idx = _getIndex(_width, _project.x, _project.y);

                        if(_options.isTransparentGrayscale) {
                            _png.data[_idx + 0] = 0;
                            _png.data[_idx + 1] = 0;
                            _png.data[_idx + 2] = 0;
                            _png.data[_idx + 3] = 255 - ((_srcPng.data[_srcIdx + 0] + _srcPng.data[_srcIdx + 1] + _srcPng.data[_srcIdx + 2]) / 3);
                            continue;
                        }
                        _png.data[_idx + 0] = _srcPng.data[_srcIdx];
                        _png.data[_idx + 1] = _srcPng.data[_srcIdx + 1];
                        _png.data[_idx + 2] = _srcPng.data[_srcIdx + 2];
                        _png.data[_idx + 3] = _srcPng.data[_srcIdx + 3];
                    }
                }

                _png.pack()
                    .pipe(_progressStream)
                    .pipe(_m.fs.createWriteStream(_outPath));
            });
    };

})(module, require, Math);


// include the underscore library
var _ = require('underscore');

// include the line reader library
var readline = require('readline');

// include the file system library
var fs = require('fs');

// include the event emitter library
var events = require('events'),
    event_emitter = new events.EventEmitter();

// include the async library
var async = require('async');

// local instance
var _instance = null;

var LineReadr = function(_filepath, _opts){

  if (_.isUndefined(_filepath) || !_.isString(_filepath)) {

    return 'A file path to read is required';

  }

  _instance = this;

  // set some options
  if (!_.isUndefined(opts.use_headers) && opts.use_headers === true) {

    if (_.isUndefined(opts.delimeter)) {

      return 'A delimeter is required if headers are required';

    }

    _instance._use_headers = true;
    _instance._delimeter = opts.delimeter;

  }

  if (!_.isUndefined(opts.lines_to_read)) {

    _instance._lines_to_read = opts.lines_to_read;

  }

  var _read_stream_options = {
    flags: 'r',
    encoding: 'utf8'
  }

  if (!_.isUndefined(_opts.encoding) && _.isString(_opts.encoding)) {

    _read_stream_options.encoding = _opts.encoding;

  }

  var _read_stream = fs.createReadStream(_filepath, _read_stream_options);

  _instance._open_readr = readline.createInterface({
    input: _read_stream,
    output: process.stdout
  })
  .pause();

  _instance._open_readr.on('line', _instance.onLine);
  _instance._open_readr.on('close', _instance.closedFile);

  return;

}

LineReadr.prototype = {
  _open_readr: null,
  _use_headers: false,
  _first_line: true,
  _delimeter: null,
  _structure: [],
  _lines_to_read: 10,
  _lines_read: 0,
  _lines: []
}

LineReadr.prototype.onLine = function(_line) {

  if (_instance._use_headers === true) {

    if (_instance._first_line === true) {

      _instance._structure = _line.trim().split(_instance._delimeter);
      first_line = false;

    }

  }

  _instance._lines_read++;

  if (!_.isNull(_instance._delimeter)) {

    var _line_bits = _line.trim().split(_instance._delimeter);

    if (!_.isEmpty(_instance._structure)) {

      var ob = {};

      for (var _is in _instance._structure) {

        ob[_instance._structure[_.is]] = _line_bits[_.is];

      }

    }

    _instance._lines.push((!_.isUndefined(ob)?ob:_line_bits);

  }

  else {

    _instance._lines.push(_line);

  }

  if (_instance._lines_read === _instance._lines_to_read) {

    _instance._open_readr.pause();
    _instance._lines_read = 0;

    event_emitter.emit('finished');

  }

}

LineReadr.prototype.closedFile = function() {

   event_emitter.emit('finished');

}

LineReadr.prototype.readLines = function(_opts, _callback) {

  _instance._lines_to_read = opts.num_lines;

  event_emitter.on('finished', function() {

    return callback(null, _instance._lines);

  })

  _instance._open_readr.resume();

}

module.exports = {
  LineReadr: LineReadr
}
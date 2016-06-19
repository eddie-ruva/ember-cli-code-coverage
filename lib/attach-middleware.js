/*jshint node:true*/
'use strict';

var bodyParser = require('body-parser');
var Istanbul = require('istanbul');
var path = require('path');
var fs = require('fs-extra');

function logError(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

module.exports = function(app, root, coverageFolder, reporters) {
  app.post('/write-coverage',
    bodyParser.json({ limit: '50mb' }),
    function(req, res) {
      var collector = new Istanbul.Collector();
      var reporter = new Istanbul.Reporter(null, path.join(root, coverageFolder));
      var sync = false;

      collector.add(req.body);

      if (reporters.indexOf('json-summary') === -1) {
        reporters.push('json-summary');
      }

      reporter.addAll(reporters);
      reporter.write(collector, sync, function() {
        var results = fs.readJSONSync(path.join(root, coverageFolder, 'coverage-summary.json'));
        res.send(results);
      });
    },
    logError);
};

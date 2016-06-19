/*jshint node:true*/
'use strict';

var path = require('path');
var fs   = require('fs');
var extend = require('extend');

function config(root, baseConfig) {
  var defaults = defaultConfig();
  // If the config was setup in the environment file, go with that.
  if (baseConfig && baseConfig.codeCoverage) {
    return extend({}, defaults, baseConfig.codeCoverage);
  }

  // If the config was setup in the coverage-config file
  var configFile = path.join(root, 'config', 'coverage-config.js');
  if (fs.existsSync(configFile)) {
    return extend({}, defaults, require(configFile));
  }

  // Fallback to defaults if no config was setup
  return defaults;
}

function defaultConfig() {
  return {
    excludes: ['*/mirage/**/*'],
    coverageEnvVar: 'COVERAGE',
    reporters: [ 'lcov', 'html' ],
    coverageFolder: 'coverage'
  };
}

module.exports = config;

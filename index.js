/* jshint node: true */
'use strict';

var path = require('path');
var fs = require('fs-extra');
var Funnel = require('broccoli-funnel');
var BroccoliMergeTrees = require('broccoli-merge-trees');
var CoverageInstrumenter = require('./lib/coverage-instrumenter');
var attachMiddleware = require('./lib/attach-middleware');
var getConfig = require('./lib/config');

module.exports = {
  name: 'ember-cli-code-coverage',

  contentFor: function(type) {
    if (!this._coverageIsEnabled()) { return; }
    if (type === 'test-body-footer') {
      return fs.readFileSync(path.join(__dirname, 'lib', 'templates', 'test-body-footer.html'));
    }
  },

  postprocessTree: function(type, tree) {
    if (this._coverageIsEnabled() && type === 'js') {
      var appFiles = new Funnel(tree, {
        exclude: this.project.config(this.app.env).excludes
      });
      var instrumentedNode = new CoverageInstrumenter(appFiles, {annotation: 'Instrumenting for code coverage'});
      return new BroccoliMergeTrees([tree, instrumentedNode], { overwrite: true });
    }
    return tree;
  },

  testemMiddleware: function(app) {
    if (!this._coverageIsEnabled()) { return; }
    var config = this.project.config(this.app.env);
    attachMiddleware(app, this.project.root, config.coverageFolder, config.reporters);
  },

  serverMiddleware: function(options) {
    if (!this._coverageIsEnabled()) { return; }
    var config = this.project.config(this.app.env);
    attachMiddleware(options.app, this.project.root, config.coverageFolder, config.reporters);
  },

  config: function(env, appConfig) {
    return getConfig(this.project.root, appConfig);
  },

  _coverageIsEnabled: function() {
    return process.env[this.project.config(this.app.env).coverageEnvVar];
  }
};


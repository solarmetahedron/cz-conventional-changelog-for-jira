'format cjs';

var engine = require('./engine');
var conventionalCommitTypes = require('conventional-commit-types');
var configLoader = require('commitizen').configLoader;

var config = configLoader.load();

function getEnvOrConfig(env, configVar, defaultValue) {
  const isEnvSet = Boolean(env);
  const isConfigSet = typeof configVar === 'boolean';

  if (isEnvSet) return env === 'true';
  if (isConfigSet) return configVar;
  return defaultValue;
}

const options = {
  types: conventionalCommitTypes.types,
  jiraMode: getEnvOrConfig(process.env.CZ_JIRA_MODE, config.jiraMode, true),
  skipScope: process.env.CZ_SKIP_SCOPE || config.skipScope || false,
  defaultType: process.env.CZ_TYPE || config.defaultType,
  defaultScope: process.env.CZ_SCOPE || config.defaultScope,
  defaultSubject: process.env.CZ_SUBJECT || config.defaultSubject,
  defaultBody: process.env.CZ_BODY || config.defaultBody,
  defaultIssues: process.env.CZ_ISSUES || config.defaultIssues,
  maxHeaderWidth:
    (process.env.CZ_MAX_HEADER_WIDTH &&
      parseInt(process.env.CZ_MAX_HEADER_WIDTH)) ||
    config.maxHeaderWidth ||
    72,
  minHeaderWidth:
    (process.env.CZ_MIN_HEADER_WIDTH &&
      parseInt(process.env.CZ_MIN_HEADER_WIDTH)) ||
    config.minHeaderWidth ||
    2,
  maxLineWidth:
    (process.env.CZ_MAX_LINE_WIDTH &&
      parseInt(process.env.CZ_MAX_LINE_WIDTH)) ||
    config.maxLineWidth ||
    100
};

(function(options) {
  try {
    var commitlintLoad = require('@commitlint/load');
    commitlintLoad().then(function(clConfig) {
      if (clConfig.rules) {
        var maxHeaderLengthRule = clConfig.rules['header-max-length'];
        if (
          typeof maxHeaderLengthRule === 'object' &&
          maxHeaderLengthRule.length >= 3 &&
          !process.env.CZ_MAX_HEADER_WIDTH &&
          !config.maxHeaderWidth
        ) {
          options.maxHeaderWidth = maxHeaderLengthRule[2];
        }
      }
    });
  } catch (err) {}
})(options);

module.exports = engine(options);

'use strict';

var dt = require('./data_types');

var DataStore = function() {
  var data = [];

  this.getData = function() {
    return data;
  }
};

DataStore.prototype.save = function(browser, result) {
  if (!result.success && !result.skipped && result.suite.length > 0) {
    var suite = this.findSuiteInResult(result);

    this.saveResultToSuite(suite, browser, result);
  }
};

DataStore.prototype.saveResultToSuite = function(suite, browser, result) {
  suite.tests = (!suite.tests) ? [] : suite.tests;
  var test = this.findTestByName(suite.tests, result.description);
  var brwsr = this.findBrowserByName(test.browsers, browser.name);

  if(result.log[0] !== null){
    brwsr.errors = result.log[0].split('\n');
  }
};

DataStore.prototype.findSuiteInResult = function(result) {
  var suite, self = this;
  var searchArray = self.getData();

  result.suite.forEach(function(suiteName, i, arr) {
    suite = self.findSuiteByName(searchArray, suiteName);

    suite.suites = (!suite.suites) ? [] : suite.suites;
    searchArray = suite.suites;
  });

  return suite;
};

DataStore.prototype.findByName = function(arr, name, Constructor) {
  var it;
  // Look through the array for an object with a
  // 'name' property that matches the 'name' arg
  arr.every(function(el, i, arr) {
    if (el.name === name) {
      it = el;
      return false;
    }
    return true;
  });

  // If a matching object is not found, create a
  // new one and push it to the provided array
  if (!it) {
    it = new Constructor(name);
    arr.push(it);
  }

  // return the object
  return it;
};

DataStore.prototype.findSuiteByName = function(arr, name) {
  return this.findByName(arr, name, dt.Suite);
};

DataStore.prototype.findTestByName = function(arr, name) {
  return this.findByName(arr, name, dt.Test);
};

DataStore.prototype.findBrowserByName = function(arr, name) {
  return this.findByName(arr, name, dt.Browser);
};

exports.getInstance = function() { return new DataStore() };

// karma.conf.js
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],

    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // e.g. disable random execution with `random: false`
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },

    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/your-project-name'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },

    reporters: ['progress', 'kjhtml'],

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,

    browsers: ['Chrome'],

    singleRun: false,
    restartOnFileChange: true
  });
};
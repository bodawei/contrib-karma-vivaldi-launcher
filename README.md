# karma-vivaldi-launcher
Launcher for Vivaldi
> This is a WIP use at your own risk. Also fork or submit PR's. This project is based on the karma-chrome-launcher.

## Installation

The easiest way is to keep `karma-vivaldi-launcher` as a devDependency in your `package.json`,
by running

```bash
$ npm install karma-vivaldi-launcher --save-dev
```

## Configuration

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    browsers: ['Vivaldi']
  })
}
```

You can pass list of browsers as a CLI argument too:

```bash
$ karma start --browsers Chrome,Chrome_without_security
```

----

For more information on Karma see the [homepage].


[homepage]: http://karma-runner.github.com

<p align="center">
  <img height="256px" width="256px" style="text-align: center;" src="https://cdn.rawgit.com/nowzoo/simple-firebase-auth/master/demo/src/assets/logo.svg">
</p>

# simple-firebase-auth - Simple Firebase Auth for Angular 4.x

[![npm version](https://badge.fury.io/js/simple-firebase-auth.svg)](https://badge.fury.io/js/simple-firebase-auth)
[![Build Status](https://travis-ci.org/nowzoo/simple-firebase-auth.svg?branch=master)](https://travis-ci.org/nowzoo/simple-firebase-auth)
[![Coverage Status](https://coveralls.io/repos/github/nowzoo/simple-firebase-auth/badge.svg?branch=master)](https://coveralls.io/github/nowzoo/simple-firebase-auth?branch=master)
[![dependency Status](https://david-dm.org/nowzoo/simple-firebase-auth/status.svg)](https://david-dm.org/nowzoo/simple-firebase-auth)
[![devDependency Status](https://david-dm.org/nowzoo/simple-firebase-auth/dev-status.svg?branch=master)](https://david-dm.org/nowzoo/simple-firebase-auth#info=devDependencies)
[![Greenkeeper Badge](https://badges.greenkeeper.io/nowzoo/simple-firebase-auth.svg)](https://greenkeeper.io/)

## Demo

View all the directives in action at https://nowzoo.github.io/simple-firebase-auth

## Dependencies
* [Angular](https://angular.io) (*requires* Angular 2 or higher, tested with 2.0.0)

## Installation
Install above dependencies via *npm*. 

Now install `simple-firebase-auth` via:
```shell
npm install --save simple-firebase-auth
```

---
##### SystemJS
>**Note**:If you are using `SystemJS`, you should adjust your configuration to point to the UMD bundle.
In your systemjs config file, `map` needs to tell the System loader where to look for `simple-firebase-auth`:
```js
map: {
  'simple-firebase-auth': 'node_modules/simple-firebase-auth/bundles/simple-firebase-auth.umd.js',
}
```
---

Once installed you need to import the main module:
```js
import { LibModule } from 'simple-firebase-auth';
```
The only remaining part is to list the imported module in your application module. The exact method will be slightly
different for the root (top-level) module for which you should end up with the code similar to (notice ` LibModule .forRoot()`):
```js
import { LibModule } from 'simple-firebase-auth';

@NgModule({
  declarations: [AppComponent, ...],
  imports: [LibModule.forRoot(), ...],  
  bootstrap: [AppComponent]
})
export class AppModule {
}
```

Other modules in your application can simply import ` LibModule `:

```js
import { LibModule } from 'simple-firebase-auth';

@NgModule({
  declarations: [OtherComponent, ...],
  imports: [LibModule, ...], 
})
export class OtherModule {
}
```

## Usage



## License

Copyright (c) 2017 Christopher Carson. Licensed under the MIT License (MIT)


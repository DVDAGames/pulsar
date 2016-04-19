# pulsar v0.2.0

Ludum Dare #35 Game Jam Entry

[Ludum Dare 35 Game Page](http://ludumdare.com/compo/ludum-dare-35/?uid=88827)

## What is it?

A mediocre top down shooter that's like if Asteroids and a bullet-hell game both had weird cousins that liked to hang out.

## Tools used

* [CreateJS](http://www.createjs.com/) (EaselJS, PreloadJS, and SoundJS)
* [Electron](http://electron.atom.io/)
* [React](https://facebook.github.io/react/) (for non-game interface elements)
* [Hapi](http://hapijs.com/) (for nice route URLs and serving static files)
* [Piskel](http://www.piskelapp.com/)
* [bfxr](http://www.bfxr.net/)

## Tools built for this game jam

* [Gamepadder](https://github.com/DVDAGames/gamepadder) - HTML GamePad API button mappings for various controllers
* [Buttonmancer](https://github.com/DVDAGames/buttonmancer) - Mapping and re-mapping of actions to specific inputs on gamepads or keyboards

## Playing

You can download the current version from the [current release page](https://github.com/DVDAGames/pulsar/releases/tag/0.2.0).

## Building

1. Perform a `git clone` of this repo
1. `cd` into the `pulsar` directory
1. Run `npm install`
1. Run `npm run watch` in a Terminal Window
1. Run `npm start` in another Terminal Window

## Packaging

1. Run `npm run build`
1. Run `npm run generate`
1. Run `cd app`
1. Run `npm install`
1. Run `npm run package`

Built application files can be found in `pulsar/dist/[current version number]/pulsar-darwin-x64`.

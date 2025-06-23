catal-uis
=========


Presentation
------------

*catal-uis* is the static web-server of the static web-site *catalos-catalui*.


Requirements
------------

- [node](https://nodejs.org) > 22.0.0
- [npm](https://docs.npmjs.com/cli) > 11.0.0


Installation
------------

```bash
npm i -D catal-uis
```


Usage
-----

```bash
npx catal-uis
npx catal-uis --help
```


Usage without installation
--------------------------

```bash
npx catal-uis
npx --package=catal-uis catal-uis
npx --package=catal-uis catal-uis --help
```


Development
-----------

```bash
git clone https://github.com/charlyoleg2/catalos
cd catalos
npm install
npm run ci
npm -w catal-uis run run
```


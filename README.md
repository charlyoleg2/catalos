Catalos
=======


Presentation
------------

This repository contains the source code of the website [catalos](https://charlyoleg2.github.io/catalos/).
*Catalos* is the website that exposes the 3D designs made with [parametrix](https://charlyoleg2.github.io/parametrix/).


Details
-------

*Catalos* is based on [astro](https://astro.build).
It can be compiled in two variants:
- a static variant: [catalos](https://charlyoleg2.github.io/catalos/)
- a dynamic variant: [catalos](https://charlyoleg2.github.io/catalos/)

*Catalos* is also deployed on [Vercel](https://catalos-catalui.vercel.app/) with more design-models.

*catalos* is a monorepo that contains the following *javascript* packages:

1. catalui: the *astro* frontend

The mono-repo allows splitting the backend in several hono-packages is needed.
The *code source* is available on [github](https://github.com/charlyoleg2/catalos).


Prerequisite
------------

- [node](https://nodejs.org) version 20.10.0 or higher
- [npm](https://docs.npmjs.com/cli/v10/commands/npm) version 10.2.4 or higher


Develop catalos
---------------

```bash
git clone https://github.com/charlyoleg2/catalos
cd catalos
npm i
npm run ci
npm run preview
```

Other useful commands:
```bash
npm run ci2
npm run clean
npm run ls-pkg
npm -w catalui run build
npm run dev
```


Publish a new release
---------------------

```bash
npm run versions
git commit -am 'increment sub-package versions'
npm version patch
git push
git push origin v0.5.6
```

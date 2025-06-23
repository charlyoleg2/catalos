Catalui
=======


Presentation
------------

*Catalui* is an Astro package for generating the frontend of *Catalos*. It is served under the domain *parametrix.fr*.


Dev
---

```bash
git clone https://github.com/charlyoleg2/catalos
cd catalos
npm i
npm -w catalui run ci
npm -w catalui run preview
npm -w catalui run clean
```

Build
-----

This build-command is used by Vercel and Clever-cloud.

```bash
DBDIR=d2 npm -w catalui run ci
```


# Svelte RDF Visualisation Lab

Svelte components for experimental visualisation of RDF - work in progress.

## Get started
To create a new project based on this template using [degit](https://github.com/Rich-Harris/degit):

```bash
npx degit sveltejs/svelte-rdf-vis
 svelte-rdf-vis

cd svelte-rdf-vis
```

Install the dependencies...

```bash
cd svelte-rdf-vis
yarn
```

...then start webpack:

```bash
yarn dev
```

Navigate to [localhost:8080](http://localhost:8080). You should see each component produce output in the browser (and the browser console). Edit a component file in `src`, save it, and the page should reload with your changes.


## Deploying to the web

### With [now](https://zeit.co/now)

Install `now` if you haven't already:

```bash
yarn global add now
```

Then, from within your project folder:

```bash
now
```

As an alternative, use the [Now desktop client](https://zeit.co/download) and simply drag the unzipped project folder to the taskbar icon.

### With [surge](https://surge.sh/)

Install `surge` if you haven't already:

```bash
yarn global add surge
```

Then, from within your project folder:

```bash
yarn build
surge public
```

## LICENSE

License: GPLv3 (see LICENSE)

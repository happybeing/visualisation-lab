# Visualisation Lab

An experimental visualisation built using Svelte - work in progress.

Having begun life as [svelte-rdf-vis](https://github.com/theWebalyst/svelte-rdf-vis), Visualisation Lab will not be
restricted to RDF / Linked Data, although that remains the initial 
and probably the main focus. If you wish to use it with other kinds of
data they can be added by implementing a small number of JavaScript classes.

The plan is to start simple but long term aim to allow visualisation
of data from multiple sources (manual, queried, loaded, filtered) to
be explored, mixed and mashed through multiple visualisations.

Svelte components are used to provide a user interface separated
into: 
- data query and access
- filtering and visual modelling
- visualisation (with a multiple configurable views)

A modular design is used to isolate implementation specific code related to 
the data type, serialisation and visual modelling. This makes it possible to
to add support for new data types and sources, for different serialisation 
formats, data structures and visual models. All by implementing a couple of 
JavaScript classes which you can probably base largely on an existing class.

A overview and detailed design notes have been written but are not yet included
in this repository. If you wish to know more or get involved, please contact
the author.

## Get started

```bash
git clone https://github.com/theWebalyst/visualisation-lab
```

Install the dependencies...

```bash
cd visualisation-lab
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

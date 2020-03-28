# Visualisation Lab

VisLab is an experimental visualisation workbench being built using Svelte. 
This is a work in progress so nothing fancy yet although potentially useful 
even now, as can be seen from the live demo which loads the latest data 
COVID-19 data directly from the WHO website.

Feedback and contributions are welcome.

Visualisation Lab aims to make it easy to do useful stuff as easily as
possible with RDF / Linked Data. So 'semantic sources' are the focus, but
this doesn't mean you can't visualise other data. Many formats will be or
are already supported from CSV to directly querying of databases.

If you wish to add support for a new data source or format you can do so by
implementing a couple of simple JavaScript classes. You can probably use
or tweak one of the existing classes, which load data from a variety of
sources, including local files, the web and RDF/SPARQL endpoints. Then
convert it into one of the standard formats used internally for visualisation
which are defined in the **VisLab JSON ViewModel Specification** (see below).

## Plan
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

An overview and detailed design notes have been written but are not yet included
in this repository. If you wish to know more or get involved, please contact
the author.

## JSON ViewModel Specification - proposed
In creating VisLab I searched in vein for a standard or documentation for a 
comprehensive set of JSON data structures designed for visualisation.

The aim of this specification is to make it quicker and easier to produce 
visualisations, reduce work on producing documentation and help improve code 
maintenance and interoperability.

Having not found anything suitable I created the [JSON ViewModel Specification](https://github.com/theWebalyst/visualisation-lab/wiki/JSON-ViewModel-Specification) 
and welcome comments, suggestions and feedback. It is will be tested in VisLab and
is open to changes that will improve its usefulness and effectiveness in other
projects.

## Get started developing

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

I include the following even though I've moved from using `now` to my regular hosting
service so I have offer `http` rather than `https` as I encountered problems accessing
some of the SPARQL demo databases when hosting under `https`. That's something that
needs looking into, so if it is in your expertise and you want to help, let me know.

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

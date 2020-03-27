<!-- UI to control how SourceResults are visualised using ViewModels and Views 

Provides a simple UI for selecting the available set of Views.

Creates and updates ViewModels when a new set of data are loaded into the 
resultDataStore, and is a place to provide UI to allow control over which
models are used by which views.
-->

<script>
import {onMount} from 'svelte';
import {writable} from 'svelte/store';
import {resultDataStore, 
        activeViews, 
        activeModelsByConsumeFormat, 
        activeModelsByFormat,
        filterFieldsStore,
        tableViewModelStore as viewModelProxyStore} from "../stores.js";

import TableFashionUI from '../views/TableFashionUI.svelte'

import {modelFormats} from '../modelFormats.js';
import {compatibleViewModels} from './viewModel.js';

import ViewNetworkGraphCanvas from '../views/ViewNetworkGraphCanvas.svelte';
import ViewTable from '../views/ViewTable.svelte';
import ViewVegaMulti from '../views/ViewVegaMulti.svelte';
import ViewVegaVoyager from '../views/ViewVegaVoyager.svelte';

// Views available for selection in UI
const viewList = [ 
  { active: false, description: "Vega Charts (ViewVegaMulti)", class: ViewVegaMulti },
  { active: true, description: "Table (ViewTable)", class: ViewTable },
  { active: false, description: "Graph (ViewNetworkGraphCanvas)", class: ViewNetworkGraphCanvas },
  { active: false, description: "Vega Voyager (ViewVegaVoyager)", class: ViewVegaVoyager },
];

function updateActiveViews() {
  let activeList = [];
  viewList.forEach(view => {if (view.active) activeList.push(view.class);});
  $activeViews = [...activeList];
}

// How ViewModels Are used
// 
// ViewModels are created and updated here, and shared via the stores:
//
//  activeModelsByConsumeFormat - maps to list of ViewModels by what they consume
//  activeModelsByFormat - maps to ViewModels by their model format
//
// The code below watches for changes to the resultDataStore and updates
// both maps accordingly.
//
// The design here is for prototyping. In an application you might want
// to handle the generation of ViewModels and connecting them to View
// components differently.
//
// For now the list of models is re-generated completely each time
// the resultDataStore updates. This ensures that all available models
// correspond to the last loaded data. It also makes 
// activeModelsByConsumeFormat redundant, but it is retained here for
// to assist debuggin during development.
//
// TODO: what to do when there are multiple ViewModels of the same format? 
// -> For now the View components will just take the first,
// but the ViewModelUI might offer a way for this to be selected in the UI,
// or for 'competing' ViewModels to be prioritised.

let unsubscribe;

onMount(() => {
  unsubscribe = resultDataStore.subscribe(rds => {
    console.log('ViewModelUI rds update:');
    console.dir(rds);

    if (rds === undefined || rds === 0) {return;}

    try {
      const resultFormat = rds.getJsonModelFormat();
      $activeModelsByConsumeFormat = new Map;
      $activeModelsByFormat = new Map;

      let activeCompatibleModels = $activeModelsByConsumeFormat.get(resultFormat);
      if (activeCompatibleModels === undefined) {
        activeCompatibleModels = [];
        const compatibleModels = compatibleViewModels.get(resultFormat);
        if (compatibleModels === undefined) throw Error('No ViewModel found to consume format: ' + resultFormat);

        compatibleModels.forEach(model => {
          // console.log('creating model: ', model);
          let newModel = new model
          activeCompatibleModels.push(newModel);
          
          // Add new model model format map used by views to find their data
          const newModelFormat = newModel.getJsonModelFormat();
          let modelsOfThisFormat = $activeModelsByFormat.get(newModelFormat);
          if (modelsOfThisFormat === undefined) modelsOfThisFormat = [];
          modelsOfThisFormat.push(newModel);
          if (newModelFormat === modelFormats.VM_TABULAR_JSON) $viewModelProxyStore = {viewModel: newModel}; // TODO: temp hack
          $activeModelsByFormat.set(newModelFormat, modelsOfThisFormat);
        });

        $activeModelsByConsumeFormat.set(resultFormat, activeCompatibleModels);
      }

      // Generate/update all view models compatible with resultFormat
      console.log('activeCompatibleModels...');
      console.dir(activeCompatibleModels);
      activeCompatibleModels.forEach(model => {
        console.dir(model);
        model.consumeSourceResult(rds);
      });

      // Force update for subscribers to activeModelsByConsumeFormat store
      // TODO: change so that each model in the activeModelsByConsumeFormat store is a store (so a view can subscribe to just one model)
      $activeModelsByConsumeFormat = $activeModelsByConsumeFormat;
      $activeModelsByFormat = $activeModelsByFormat;
    } catch(e) {
      console.log('ViewModelUI - failed to consume results (SourceResult)');
      console.error(e);
    }
  });

  updateActiveViews();
});

</script>
<style>
.main { 
  background: rgba(241, 203, 152, 0.582);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 1cm;
  padding-right: 1cm;
  padding-bottom: 1cm;
}
</style>

<div class="main">
  <p>The &lt;ViewModelUI&gt; selects and configures active views, 
  provides control over the view model, and 
  provides filters that are applied to the model to show/hide 
  elements in the View.</p>
  <TableFashionUI {viewModelProxyStore} {filterFieldsStore}/>
  <p><b>Display views of type:</b></p>
  <p>
    {#each viewList as view}
      <label><input type=checkbox bind:checked={view.active} on:change={updateActiveViews}>{view.description}</label>
    {/each}
  </p>

  {#each $activeViews as viewUI, i} 
    <!-- TODO deprecate activeModelsByFormat -->
    <svelte:component this= {viewUI} {activeModelsByFormat}  {viewModelProxyStore}/>
  {/each}
</div>
<!-- Map SourceResult to objects for visualisation 

Provides
- updates a set of ViewModels with data from the latest SourceResult
NEXT>>> - TODO: clear view models when SourceResult is changed
- provides UI to select View components are active
- TODO: a UI defining filters to apply to SourceResults
-->

<script>
import {onMount} from 'svelte';

import FiltersUI from './FiltersUI.svelte'

import {modelFormats} from '../modelFormats.js';
import {compatibleViewModels} from './viewModel.js';

import ViewNetworkGraphCanvas from '../views/ViewNetworkGraphCanvas.svelte';
import ViewRdfInSvelteTable from '../views/ViewRdfInSvelteTable.svelte';

import {resultDataStore, activeViews, activeModelsByConsumeFormat, activeModelsByFormat} from "../stores.js";

let rdfViewModel;
let showViewDebug = false;

// Active view models by SourceResult type
const resultsModelMap = new Map;  // Map of SourceResults types to a ViewModel (that consumes the result type)

// Update View Models when SourceResult changes

let unsubscribe;

onMount(() => {
  unsubscribe = resultDataStore.subscribe(rds => {
    console.log('ViewModelUI rds update:');
    console.dir(rds);
    if (rds === undefined || rds === 0) {return;}

    try {
      const resultFormat = rds.getModelFormat();
      let activeCompatibleModels = $activeModelsByConsumeFormat.get(resultFormat);
      if (activeCompatibleModels === undefined) {
        activeCompatibleModels = [];
        const compatibleModels = compatibleViewModels.get(resultFormat);
        if (compatibleModels === undefined) throw Error('No ViewModel found to consume format: ', resultFormat);

        compatibleModels.forEach(model => {
          // console.log('creating model: ', model);
          let newModel = new model
          activeCompatibleModels.push(newModel);
          
          // Add new model model format map used by views to find their data
          const newModelFormat = newModel.getValuesFormat();
          let modelsOfThisFormat = $activeModelsByFormat.get(newModelFormat);
          if (modelsOfThisFormat === undefined) modelsOfThisFormat = [];
          modelsOfThisFormat.push(newModel);
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

// Views available for selection in UI
const viewList = [ 
  { active: true, description: "Graph (ViewNetworkGraphCanvas)", class: ViewNetworkGraphCanvas },
  { active: true, description: "Table (ViewRdfInSvelteTable)", class: ViewRdfInSvelteTable },
];


function updateActiveViews() {
  let activeList = [];
  viewList.forEach(view => {if (view.active) activeList.push(view.class);});
  $activeViews = [...activeList];
}

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
  <h2>&lt;ViewModelUI&gt;</h2>
  <p>The ViewModelUI provides control over the view model, and 
  provides filters that are applied to the model to show/hide 
  elements in the View.</p>
  <FiltersUI/>
  {#each viewList as view}
    <label><input type=checkbox bind:checked={view.active} on:change={updateActiveViews}>{view.description}</label>
  {/each}
</div>
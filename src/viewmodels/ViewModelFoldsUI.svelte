<!-- Incremental UI to control how SourceResults are visualised using ViewModels and Views 

Exprimental View API, based on the earlier ViewModelUI.
Provides an incremental UI for Views of data loaded into VisLab.
Uses componentents from svelte-iux to provide incremental features.

Creates and updates ViewModels when a new set of data are loaded into the 
resultDataStore, and is a place to provide UI to allow control over which
models are used by which views.
-->

<script>
import {onMount} from 'svelte';
import {writable} from 'svelte/store';
import {IUXFold, IUXRevealArea, IUXRevealContainer} from 'svelte-iux';

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

$: haveTableModels = $activeModelsByFormat ? $activeModelsByFormat.get(modelFormats.VM_TABULAR_JSON) : false;
$: haveNetworkModels = $activeModelsByFormat ? $activeModelsByFormat.get(modelFormats.VM_GRAPH_JSON) : false;
export let autoEnable = false;  // Disable unless model data is available

// Views available for selection in UI
const viewList = [ 
  { active: false, description: "Vega Charts (ViewVegaMulti)", class: ViewVegaMulti },
  { active: false, description: "Table (ViewTable)", class: ViewTable },
  { active: true, description: "Graph (ViewNetworkGraphCanvas)", class: ViewNetworkGraphCanvas },
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

let dataToChart = true;
$: dataToChartButtonText = dataToChart ? '<<Close' : 'Open>>';

let networkViewOpen = false;
let chartViewOpen = false;
let tableViewOpen = false;

// window.debugView = true;

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

.hidden {
  visibility: hidden;
  width: 0;
  height: 0;
}

</style>

<div  class={window.debugView ? "main" : ""}>

  <IUXFold heading='View as Network Graph' 
    disabled={!haveNetworkModels} bind:reveal={networkViewOpen}
    headingReveal=''
    headingElement={'h3'} 
    protrudingHeight={44}
    buttonLabel='open network'
    buttonLabelReveal={'close'}
    buttonLabelDisabled={'no data'} >
    <p>
      Use mouse to zoom or drag chart background, drag nodes, or hover over nodes for information.
    </p>
    <ViewNetworkGraphCanvas {activeModelsByFormat}  {viewModelProxyStore}/>
  </IUXFold>

  <IUXFold heading='View as Table with Line Graph' 
    disabled={!haveTableModels} bind:reveal={chartViewOpen} 
    headingReveal='' headingElement={'h3'} 
    protrudingHeight={44} 
    buttonLabel='open charts'
    buttonLabelReveal='close'
    buttonLabelDisabled={'no data'} >
    <p>
      Choose one column for the X-axis and enter column names to plot: 
      <a style='cursor: pointer;' on:click={() => dataToChart = !dataToChart}>{dataToChartButtonText}</a>
    </p>
    <IUXRevealArea reveal={dataToChart}>
      <ViewTable {activeModelsByFormat}  {viewModelProxyStore}/>
    </IUXRevealArea>
    <ViewVegaMulti {activeModelsByFormat}  {viewModelProxyStore}/>

    <IUXFold heading='View as Table' 
      disabled={!haveTableModels} bind:reveal={tableViewOpen} 
      headingReveal='' 
      headingElement={'h3'} 
      protrudingHeight={44}
      buttonLabel='open table' 
      buttonLabelReveal='close'
      buttonLabelDisabled={'no data'} >
      <p>
        Filter rows by choosing values from column headings. 
      </p>
      <ViewTable {activeModelsByFormat}  {viewModelProxyStore}/>
    </IUXFold>

  </IUXFold>

</div>
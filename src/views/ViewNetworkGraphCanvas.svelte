<!-- d3 Force Directed Graph in Svelte js - canvas with d3 hit detection -->

<script>
import { onMount, onDestroy, tick } from 'svelte';

import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { zoom, zoomIdentity } from 'd3-zoom';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { select, selectAll, mouse } from 'd3-selection';
import { drag } from 'd3-drag';
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';

import {event as currentEvent} from 'd3-selection'  // Needed to get drag working, see: https://github.com/d3/d3/issues/2733
let d3 = { zoom, zoomIdentity, scaleLinear, scaleOrdinal, schemeCategory10, select, selectAll, mouse, drag,  forceSimulation, forceLink, forceManyBody, forceCenter }

import {modelFormats} from '../modelFormats.js';
export let activeModelsByFormat;

let canvas;
let width = 1000;
let height = 600;
const nodeRadius = 5;

const padding = { top: 20, right: 40, bottom: 40, left: 25 };
const groupColour = d3.scaleOrdinal(d3.schemeCategory10);

let viewModel;
const emptyGraph =  {nodes: [], links: []};
let graph = emptyGraph;
$: graph = updateGraph($activeModelsByFormat);

function updateGraph (activeModelsByFormat) {
  let allModels = activeModelsByFormat.get(modelFormats.VM_GRAPH_JSON);
  if (allModels === undefined) return {nodes: [], links: []};

  // TODO how to handle multiple compatible models? (We visualise only the first)
  let graph = emptyGraph;
  try {
    viewModel = allModels[0];  
    const values = viewModel.getJsonModelValues();
    graph = {nodes: [...values.nodes.values()], links: [...values.links.values()]};
  } catch(e) {console.error(e);}
  return graph;
} 

$: links = graph.links.map(d => Object.create(d));
$: nodes = graph.nodes.map(d => Object.create(d));

let unsubscribe;

onMount(() => {
  unsubscribe = activeModelsByFormat.subscribe(async $data => {
    // Have to use tick so links and nodes can catch up
    await tick();
    render();
  });
});

onDestroy(() => {
  unsubscribe();
});

let transform = d3.zoomIdentity;
let simulation, context

function render () {
  if (simulation) {
    simulation.nodes([])
    .force("link", d3.forceLink([]))
    simulation = undefined;
  }

  context = canvas.getContext('2d');
  resize()
  
  simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", simulationUpdate);

  // title
  d3.select(context.canvas)
    .on("mousemove", () => {
    const mouse = d3.mouse(context.canvas);
    const d = simulation.find(transform.invertX(mouse[0]), transform.invertY(mouse[1]), nodeRadius);
    
    if (d) 
      context.canvas.title = d.id;
    else
      context.canvas.title = '';
  });

  d3.select(canvas)
  .call(d3.drag()
    .container(canvas)
    .subject(dragsubject)
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended))
  .call(d3.zoom()
    .scaleExtent([1 / 10, 8])
    .on('zoom', zoomed));    
}

// TODO This style implementation is for testing using dbPedia RDF properties
// TODO Change to use styling via the ViewModel (Fashion class?) when implemented
function nodeColour (node) {
  const defaultNodeColour = "grey";
  let colour = defaultNodeColour;
  
  if (propertyHasValueEndingWith(node, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'Person'))
    colour = "rgba(103, 152, 103, 1)";
   
  if (propertyHasValue(node, 'http://xmlns.com/foaf/0.1/gender', 'male'))
    colour = "rgba(0, 155, 255, 1)"; // Pale blue
  else if (propertyHasValue(node, 'http://xmlns.com/foaf/0.1/gender', 'female'))
    colour = "pink";

  return colour;
}

function nodeStrokeStyle (node) {
  let stroke = "#fff";
  if (propertyHasValue(node, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://dbpedia.org/class/yago/Ruler110541229'))
    stroke = "#100";
  return stroke;
}

function nodeLineWidth (node) {
  let width = 1.5;
  if (propertyHasValue(node, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://dbpedia.org/class/yago/Ruler110541229'))
    width *= 2.5;
  return width;
}

function linkColour (link) {
  return "blue";
}

function nodeImageUrl (node) {
  let uri = node['http://dbpedia.org/ontology/thumbnail'] ? 
    node['http://dbpedia.org/ontology/thumbnail'][0].value : undefined;

  // Strip any uri params
  return uri ? uri.slice(0,uri.indexOf('?')) : undefined; 
}

function propertyHasValue (item, property, value) {
  let match = false
  if(item[property])
    item[property].forEach(set => match |= set.value === value);
  return match;
}

function propertyHasValueEndingWith (item, property, ending) {
  let match = false
  if(item[property])
    item[property].forEach(set => match |= set.value.endsWith(ending));
  return match;
}

function simulationUpdate () {
  context.save();
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.translate(transform.x, transform.y);
  context.scale(transform.k, transform.k);

  links.forEach(d => {
    context.beginPath();
    context.moveTo(d.source.x, d.source.y);
    context.lineTo(d.target.x, d.target.y);
    context.globalAlpha = 0.6;
    context.strokeStyle = linkColour(d);//"#999";
    context.lineWidth = Math.sqrt(d.strength ? d.strength : d.value);
    context.stroke();
    context.globalAlpha = 1;
  });
  
  nodes.forEach((d, i) => {
    context.beginPath();
    context.arc(d.x, d.y, nodeRadius, 0, 2*Math.PI);
    context.strokeStyle = nodeStrokeStyle(d);//"#fff";
    context.lineWidth = nodeLineWidth(d);//1.5;
    context.stroke();
    context.fillStyle = nodeColour(d);//groupColour(d.group);
    context.fill();
    
    // context.font = "bold 32px Arial";
    // context.textAlign = "center";
    // context.textBaseline = "middle";    
    // context.fillText("Hello World!", d.x, d.y);

    const imageUri = nodeImageUrl(d);
    if (imageUri) {
      console.log('node image: ' + imageUri);
      console.dir(d);
      let image = new Image;
      image.src = imageUri;
      image.alt = "it works!";
      context.drawImage(image, d.x, d.y, 20, 20);
    }
  });
  context.restore();
}

function zoomed() {
  transform = currentEvent.transform;
  simulationUpdate();
}

// Use the d3-force simulation to locate the node
function dragsubject() {
  const node = simulation.find(transform.invertX(currentEvent.x), transform.invertY(currentEvent.y), nodeRadius);
  if (node) {
    node.x = transform.applyX(node.x);
    node.y = transform.applyY(node.y);
  }
  return node;
}

function dragstarted() {
  if (!currentEvent.active) simulation.alphaTarget(0.3).restart();
  currentEvent.subject.fx = transform.invertX(currentEvent.subject.x);
  currentEvent.subject.fy = transform.invertY(currentEvent.subject.y);
}

function dragged() {
  currentEvent.subject.fx = transform.invertX(currentEvent.x);
  currentEvent.subject.fy = transform.invertY(currentEvent.y);
}

function dragended() {
  if (!currentEvent.active) simulation.alphaTarget(0);
  currentEvent.subject.fx = null;
  currentEvent.subject.fy = null;
}

function resize() {
  ({ width, height } = canvas);
}

</script>

<svelte:window on:resize='{resize}'/>

<style>
.main { 
  background: rgba(134, 174, 212, 0.185);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 1cm;
  padding-right: 1cm;
  padding-bottom: 1cm;
}
canvas {
    float: left;
}
</style>

<div class='main' >
  <p>&lt;ViewNetworkGraphCanvas&gt; uses d3-force to display a scalable interactive graph.</p>
  <p>TODO: wrap ViewNetworkGraphCanvas & co. in View (or ViewUI?) and size canvas to its div</p>

  <div class='container' style='width: {width}px; height: {height}px'>
    <canvas bind:this={canvas} width='{width}' height='{height}'/>
  </div>
</div>

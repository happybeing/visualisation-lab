<!-- d3 Force Directed Graph in Sveltejs - D3 created svg and DOM elements (zoom) -->

<script>
import { onMount, onDestroy, tick } from 'svelte';

import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { zoom, zoomIdentity } from 'd3-zoom';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { select, selectAll, pointer } from 'd3-selection';
import { drag } from 'd3-drag';
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';

let d3 = { zoom, zoomIdentity, scaleLinear, scaleOrdinal, schemeCategory10, select, selectAll, pointer, drag,  forceSimulation, forceLink, forceManyBody, forceCenter }

export let graph;

let width = 500;
let height = 600;
const nodeRadius = 5;

const padding = { top: 20, right: 40, bottom: 40, left: 25 };

$: links = $graph.links.map(d => Object.create(d));
$: nodes = $graph.nodes.map(d => Object.create(d));  

onMount(() => {
	const unsubscribe = graph.subscribe(async $data => {
			// Have to use tick so links and nodes can catch up
			await tick();
			render();
	});
});

let simulation, svg;
onDestroy(() => {
console.log('onDestroy()');
    unsubscribe();
    destroyD3Elements();
});

function destroyD3Elements () {
      d3.select("svg").remove();
    svg = undefined;
}

const colourScale = d3.scaleOrdinal(d3.schemeCategory10);

function render () {
    destroyD3Elements();
if (simulation) {
  simulation.nodes([])
  .force("link", d3.forceLink([]))
  simulation = undefined;
}

    simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on('tick', simulationUpdate);

    svg = d3.select(".chartdiv")
        .append("svg")
        .attr("width", width)
        .attr("height", height)

    const g = svg.append("g");    // Need container when combininig drag and zoom
                                // See example: https://observablehq.com/@d3/drag-zoom

    const link = g.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.strength ? d.strength : d.value));

    const node = g.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .attr("fill", d => colourScale(d.group))
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))

    node.append("title")
        .text(d => d.id);

    svg.call(d3.zoom()
            .extent([[0, 0], [width, height]])
            .scaleExtent([1 / 10, 8])
            .on("zoom", zoomed));
        
    function simulationUpdate () {
        simulation.tick();
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y)

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
        }

    function zoomed() {
        g.attr("transform", currentEvent.transform)
        simulationUpdate();
    }
}

function dragstarted(currentEvent) {
    if (!currentEvent.active) simulation.alphaTarget(0.3).restart();
    currentEvent.subject.fx = currentEvent.x;
    currentEvent.subject.fy = currentEvent.y;
}

function dragged(currentEvent) {
    currentEvent.subject.fx = currentEvent.x;
    currentEvent.subject.fy = currentEvent.y;
}

function dragended(currentEvent) {
    if (!currentEvent.active) simulation.alphaTarget(0);
    currentEvent.subject.fx = null;
    currentEvent.subject.fy = null;
}

function resize() {
    ({ width, height } = svg.getBoundingClientRect());
}

</script>

<svelte:window on:resize='{resize}'/>

<div class='chartdiv'></div>
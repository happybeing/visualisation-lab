import { writable } from "svelte/store";
const RdfDataset = require('@graphy/memory.dataset.fast');

export const rdfDataset = writable(0);
rdfDataset.set(RdfDataset());

export const graph = writable(0);

import { writable } from "svelte/store";

export const resultDataStore = writable(0);           // Updated by SourceUI, consumed by DataViewUI
export const graph = writable({nodes: [], links: []});// Updated by DataViewUI, consumed by View

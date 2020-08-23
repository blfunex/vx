function toJSON(response: Response) {
  return response.json();
}

function toBlob(response: Response) {
  return response.blob();
}

function toText(response: Response) {
  return response.text();
}

function toBuffer(response: Response) {
  return response.arrayBuffer();
}

export function fetch(source: string, signal: AbortSignal | undefined) {
  return globalThis.fetch(source, { method: "get", signal });
}

export function fetchText(source: string, signal?: AbortSignal) {
  return fetch(source, signal).then(toText);
}

export function fetchBlob(source: string, signal?: AbortSignal) {
  return fetch(source, signal).then(toBlob);
}

export function fetchBuffer(source: string, signal?: AbortSignal) {
  return fetch(source, signal).then(toBuffer);
}

export function fetchJSON(source: string, signal?: AbortSignal) {
  return fetch(source, signal).then(toJSON);
}

export function fetchImageBitmap(source: string, signal?: AbortSignal) {
  return fetchBlob(source, signal).then(createImageBitmap);
}

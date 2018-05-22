/* global fetch: false */

export default async function fetchAsText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    return Promise.reject(response);
  }
  return response.text();
}

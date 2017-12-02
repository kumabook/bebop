export default function getLinks({ query = '', maxResults = 20 }) {
  const links = document.getElementsByTagName('a');
  return Array.prototype.filter.call(links, (l) => {
    return l.href.includes(query) || l.text.includes(query);
  }).slice(0, maxResults).map((link) => ({
    url: link.href,
    label: link.text,
  }));
}

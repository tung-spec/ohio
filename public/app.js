const form = document.querySelector('#search-form');
const input = document.querySelector('#search-input');
const resultsContainer = document.querySelector('#results');
const status = document.querySelector('#status');
const resultsSection = document.querySelector('#results-section');

function showMessage(message) {
  status.textContent = message;
}

function renderResults(results) {
  resultsContainer.replaceChildren();

  for (const result of results) {
    const card = document.createElement('article');
    card.className = 'result-card';

    const link = document.createElement('a');
    link.className = 'result-title';
    link.href = result.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = result.title;

    const address = document.createElement('p');
    address.className = 'result-url';
    address.textContent = result.url;

    const description = document.createElement('p');
    description.className = 'result-description';
    description.textContent = result.description;

    card.append(link, address, description);
    resultsContainer.append(card);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = input.value.trim();
  if (!query) return;

  resultsContainer.replaceChildren();
  resultsSection.setAttribute('aria-busy', 'true');
  showMessage('Searching the web…');
  const params = new URLSearchParams({ q: query });
  history.replaceState(null, '', `/?${params.toString()}`);

  try {
    const response = await fetch(`/api/search?${params.toString()}`, {
      headers: { Accept: 'application/json' }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Search failed.');

    renderResults(data.results || []);
    showMessage(data.results?.length ? `Results for “${query}”` : `No results found for “${query}”.`);
  } catch (error) {
    showMessage(error.message || 'Search is temporarily unavailable. Please try again.');
  } finally {
    resultsSection.setAttribute('aria-busy', 'false');
  }
});

const initialQuery = new URLSearchParams(location.search).get('q');
if (initialQuery) {
  input.value = initialQuery.slice(0, 200);
  form.requestSubmit();
}

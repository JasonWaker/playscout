(() => {
  const masthead = document.querySelector('.masthead');
  const menu = document.querySelector('.menu-button');
  menu?.addEventListener('click', () => {
    const open = masthead.classList.toggle('nav-open');
    menu.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('keydown', event => {
    if (event.key === '/' && !/input|textarea/i.test(document.activeElement?.tagName || '')) {
      event.preventDefault();
      location.href = document.querySelector('.search-trigger')?.href || '/search/';
    }
    if (event.key === 'Escape') {
      masthead?.classList.remove('nav-open');
      menu?.setAttribute('aria-expanded', 'false');
    }
  });

  document.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        const old = button.textContent;
        button.textContent = 'Copied';
        button.classList.add('copied');
        setTimeout(() => { button.textContent = old; button.classList.remove('copied'); }, 1600);
      } catch {
        button.textContent = button.dataset.copy;
      }
    });
  });

  document.querySelectorAll('[data-rank-tab]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-rank-tab]').forEach(item => item.classList.toggle('selected', item === button));
      document.querySelectorAll('[data-rank-panel]').forEach(panel => panel.classList.toggle('is-hidden', panel.dataset.rankPanel !== button.dataset.rankTab));
    });
  });

  document.querySelectorAll('[data-home-chart]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-home-chart]').forEach(item => item.classList.toggle('selected', item === button));
      document.querySelectorAll('[data-home-chart-panel]').forEach(panel => panel.classList.toggle('is-hidden', panel.dataset.homeChartPanel !== button.dataset.homeChart));
    });
  });

  const gameSearch = document.querySelector('[data-game-search]');
  if (gameSearch) {
    const items = [...document.querySelectorAll('[data-game-item]')];
    const count = document.querySelector('[data-result-count]');
    const applyGameFilter = () => {
      const term = gameSearch.value.trim().toLowerCase();
      let visible = 0;
      items.forEach(item => {
        const match = !term || item.dataset.search.includes(term);
        item.hidden = !match;
        if (match) visible++;
      });
      count.textContent = `${visible} game${visible === 1 ? '' : 's'} shown`;
    };
    gameSearch.addEventListener('input', applyGameFilter);
    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(item => item.classList.toggle('selected', item === button));
      gameSearch.value = button.dataset.filter === 'all' ? '' : button.dataset.filter;
      applyGameFilter();
    }));
  }

  const pulseSearch = document.querySelector('[data-pulse-search]');
  if (pulseSearch) {
    const cards = [...document.querySelectorAll('[data-pulse-card]')];
    const count = document.querySelector('[data-pulse-count]');
    let kind = 'all';
    const applyPulseFilter = () => {
      const term = pulseSearch.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const matchesKind = kind === 'all' || card.dataset.kind === kind;
        const matchesTerm = !term || card.dataset.search.includes(term);
        card.hidden = !(matchesKind && matchesTerm);
        if (matchesKind && matchesTerm) visible++;
      });
      count.textContent = `${visible} briefing${visible === 1 ? '' : 's'} shown`;
    };
    pulseSearch.addEventListener('input', applyPulseFilter);
    document.querySelectorAll('[data-pulse-filter]').forEach(button => button.addEventListener('click', () => {
      kind = button.dataset.pulseFilter;
      document.querySelectorAll('[data-pulse-filter]').forEach(item => item.classList.toggle('selected', item === button));
      applyPulseFilter();
    }));
  }

  const savedPulseKey = 'playscout.savedPulse';
  let savedPulse = [];
  try { savedPulse = JSON.parse(localStorage.getItem(savedPulseKey) || '[]'); } catch {}
  document.querySelectorAll('[data-save-pulse]').forEach(button => {
    const id = button.dataset.savePulse;
    const paint = () => {
      const saved = savedPulse.includes(id);
      button.setAttribute('aria-pressed', String(saved));
      button.textContent = saved ? '♥ Saved' : '♡ Save';
    };
    paint();
    button.addEventListener('click', () => {
      savedPulse = savedPulse.includes(id) ? savedPulse.filter(item => item !== id) : [...savedPulse, id];
      try { localStorage.setItem(savedPulseKey, JSON.stringify(savedPulse)); } catch {}
      paint();
    });
  });

  document.querySelectorAll('[data-share-pulse]').forEach(button => {
    button.addEventListener('click', async () => {
      const url = new URL(button.dataset.sharePulse, location.href).href;
      const title = `${button.dataset.shareTitle} on PlayScout Game Pulse`;
      try {
        if (navigator.share) await navigator.share({ title, url });
        else {
          await navigator.clipboard.writeText(url);
          const old = button.textContent;
          button.textContent = 'Link copied';
          setTimeout(() => { button.textContent = old; }, 1600);
        }
      } catch (error) {
        if (error?.name !== 'AbortError') location.href = url;
      }
    });
  });

  const searchInput = document.querySelector('[data-site-search]');
  if (searchInput) {
    const index = JSON.parse(document.querySelector('#search-index').textContent);
    const results = document.querySelector('[data-search-results]');
    const count = document.querySelector('[data-search-count]');
    const params = new URLSearchParams(location.search);
    searchInput.value = params.get('q') || '';
    const render = () => {
      const terms = searchInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.length) { results.innerHTML = ''; count.textContent = `Start typing to search ${index.length} pages.`; return; }
      const matches = index.filter(item => terms.every(term => `${item.title} ${item.text} ${item.type}`.toLowerCase().includes(term))).slice(0, 24);
      count.textContent = `${matches.length} result${matches.length === 1 ? '' : 's'} found`;
      results.innerHTML = matches.length ? matches.map(item => `<a href="${item.url}"><small>${item.type}</small><strong>${item.title}</strong><span>${item.text}</span></a>`).join('') : '<div class="empty-state"><strong>No matching pages.</strong><p>Try a game name, genre, “codes” or “beginner”.</p></div>';
    };
    searchInput.addEventListener('input', render);
    searchInput.form.addEventListener('submit', event => { event.preventDefault(); history.replaceState(null, '', `?q=${encodeURIComponent(searchInput.value)}`); render(); });
    render();
  }
})();

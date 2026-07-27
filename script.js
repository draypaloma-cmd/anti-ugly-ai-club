// Only runs on index.html (needs #gallery in the page).
document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  const modalOverlay = document.getElementById('modalOverlay');
  const modalImage = document.getElementById('modalImage');
  const modalKicker = document.getElementById('modalKicker');
  const modalTitle = document.getElementById('modalTitle');
  const modalCaption = document.getElementById('modalCaption');
  const modalTags = document.getElementById('modalTags');
  const modalClose = document.getElementById('modalClose');
  const filterIndicator = document.getElementById('filterIndicator');
  const filterTagLabel = document.getElementById('filterTagLabel');
  const clearFilterBtn = document.getElementById('clearFilter');
  const featuredImage = document.getElementById('featuredImage');
  const featuredCaption = document.getElementById('featuredCaption');
  const featuredTags = document.getElementById('featuredTags');

  let activeTag = null;
  let ALL_POSTS = [];
  let FEATURE = null;
  let POSTERS = [];

  function findPoster(id) {
    return ALL_POSTS.find(p => p.id === id);
  }

  function paragraphs(text) {
    return (text || '').split(/\n\s*\n/).map(t => `<p>${t}</p>`).join('');
  }

  function openModal(id) {
    const p = findPoster(id);
    if (!p) return;
    modalImage.src = p.imgSrc;
    modalImage.alt = p.title;
    modalKicker.textContent = p.kicker;
    modalTitle.textContent = p.title;
    modalCaption.textContent = p.caption;
    renderTags(modalTags, p.hashtags, true);
    modalOverlay.hidden = false;
  }

  function closeModal() {
    modalOverlay.hidden = true;
  }

  function renderTags(container, hashtags, closeModalOnClick) {
    container.innerHTML = '';
    (hashtags || []).forEach(tag => {
      const btn = document.createElement('button');
      btn.className = 'tag';
      btn.textContent = tag;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setFilter(tag);
        if (closeModalOnClick) closeModal();
      });
      container.appendChild(btn);
    });
  }

  function setFilter(tag) {
    activeTag = activeTag === tag ? null : tag;
    renderGallery();
  }

  function renderGallery() {
    if (activeTag) {
      filterIndicator.hidden = false;
      filterTagLabel.textContent = activeTag;
    } else {
      filterIndicator.hidden = true;
    }

    const list = activeTag ? POSTERS.filter(p => (p.hashtags || []).includes(activeTag)) : POSTERS;
    gallery.innerHTML = '';
    list.forEach(p => {
      const card = document.createElement('div');
      card.className = 'poster-card';
      card.innerHTML = `
        <img src="${p.imgSrc}" alt="${p.title}">
        <div class="poster-title">${p.title}</div>
        <div class="poster-kicker">${p.kicker}</div>
      `;
      card.addEventListener('click', () => openModal(p.id));
      gallery.appendChild(card);
    });
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
  clearFilterBtn.addEventListener('click', () => setFilter(activeTag));

  fetch('posters.json')
    .then(res => res.json())
    .then(data => {
      ALL_POSTS = data.posts || [];
      FEATURE = ALL_POSTS.find(p => p.featured) || ALL_POSTS[0];
      POSTERS = ALL_POSTS.filter(p => p.id !== (FEATURE ? FEATURE.id : null));

      if (FEATURE) {
        featuredImage.src = FEATURE.imgSrc;
        featuredImage.alt = FEATURE.title;
        featuredCaption.innerHTML = paragraphs(FEATURE.caption);
        renderTags(featuredTags, FEATURE.hashtags, false);
        document.querySelector('.featured-image-wrap').addEventListener('click', () => openModal(FEATURE.id));
      }

      renderGallery();
    })
    .catch(err => {
      gallery.innerHTML = '<p style="padding:20px;color:#888;">Could not load posters.json.</p>';
      console.error(err);
    });
});

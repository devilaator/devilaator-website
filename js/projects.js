(() => {
  'use strict';
  // Uue projektikaardi lisamiseks lisa siia üks kirje.
  const projects = [
    {
      id: 'PROJECT_01', name: 'QUIT30', label: 'ANDROID • APP', status: 'TESTIMISEL',
      description: 'Nutikas 30-päevane loobumisäpp, mis aitab sul püsida suitsuvabal rajal. Reaalajas ülevaade säästudest, edusammudest ja igapäevasest toest.',
      image: 'img/quit30.jpg', alt: 'QUIT30 äpi ekraanipilt', url: 'quit30.html'
    },
    {
      id: 'PROJECT_02', name: 'STEADY HAND', label: 'ANDROID • MÄNG', status: 'TESTIMISEL',
      description: 'Telefoni liikumisanduritel põhinev stabiilsus- ja tasakaalumäng.',
      image: 'img/steady-hand.jpg', alt: 'STEADY HAND Android mäng', url: 'steady-hand.html'
    },
    {
      id: 'PROJECT_03', name: 'AJUVABA ÄPP', label: 'EXPERIMENT', status: 'TULEMAS',
      description: 'Arendusjärgus. Ajuvaba äpp, millel puudub loogika.'
    }
  ];
  const grid = document.querySelector('#project-grid');
  if (!grid) return;
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const fragment = document.createDocumentFragment();
  for (const project of projects) {
    const card = element('article', 'project-card');
    const top = element('div', 'project-top');
    top.append(element('span', 'project-badge', project.label),
      element('span', `project-status${project.status === 'TESTIMISEL' ? ' project-status-testing' : ''}`, project.status));
    const preview = element('div', 'project-preview-area');
    if (project.image) {
      const image = element('img', 'project-preview');
      image.src = project.image;
      image.alt = project.alt;
      image.loading = 'lazy';
      image.decoding = 'async';
      preview.append(image);
    } else {
      preview.classList.add('project-preview-empty');
      preview.setAttribute('aria-hidden', 'true');
    }
    const action = element(project.url ? 'a' : 'span', `project-link${project.url ? '' : ' disabled'}`, project.url ? 'VAATA PROJEKTI →' : 'Varsti →');
    if (project.url) action.href = project.url;
    card.append(element('span', 'project-id', project.id), top, element('h3', '', project.name), preview, element('p', '', project.description), action);
    fragment.append(card);
  }
  grid.replaceChildren(fragment);
})();

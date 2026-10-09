(() => {
  'use strict';
  // Tulevastele projektidele lisa lehe link alles siis, kui projektileht on olemas.
  const projects = [
    {
      id: 'PROJECT_01', name: 'QUIT30', label: 'ANDROID • APP', status: 'UUENDAMISEL',
      description: 'Nutikas 30-päevane loobumisäpp, mis aitab sul püsida suitsuvabal rajal. Reaalajas ülevaade säästudest, edusammudest ja igapäevasest toest.',
      image: 'img/quit30.jpg', alt: 'QUIT30 äpi ekraanipilt', url: 'quit30.html'
    },
    {
      id: 'PROJECT_02', name: 'STEADY HAND', label: 'ANDROID • MÄNG', status: 'TESTIMISEL',
      description: 'Telefoni liikumisanduritel põhinev stabiilsus- ja tasakaalumäng.',
      image: 'img/steady-hand.jpg', alt: 'STEADY HAND Android mäng', url: 'steady-hand.html',
      cardClass: 'steady-hand-project'
    },
    {
      id: 'PROJECT_03',
      name: 'KILBIHALDUS',
      label: 'WEB • APP',
      status: 'TESTFAASIS OLEV TARKVARA',
      statusDescription: 'Kilbihaldust testitakse hetkel veel objektil ja tööolukorras.',
      description: 'Kas ei tea, kus mis asub või kust toide tuleb? Appi võta Kilbihaldus - elektripaigaldise digitaalne kaart sinu taskus. Kilbid, grupid, toiteahelad, dokumendid ning hooldus ühes kohas. Kogu objekti elektripaigaldisest selge ning täielik ülevaade otse ekraanilt.',
      image: 'img/kilbihaldus-logo.png',
      imageClass: 'kilbihaldus-project-logo',
      alt: 'Kilbihaldus',
      url: 'kilbihaldus.html',
      actionLabel: 'VAATA PROJEKTI'
    },
    
      {
        id: 'PROJECT_04',
        name: 'ELVA POKSIKLUBI',
        label: 'WEB • APP',
        status: 'TEGEMISEL',
        description: 'Veebileht ja klubihaldussüsteem koos multimeedia, treeningute, liikmete, broneeringute ja kalendri ning väikese e-poe jaoks.',
        image: 'img/elva-poksiklubi.png',
        alt: 'Vanad poksikindad poksiringi nurgas',
        secretUrl: 'https://poksiklubi.pages.dev'
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
    const placeholder = !project.url && !project.secretUrl;
    const card = element(
      'article',
      `project-card${placeholder ? ' project-placeholder' : ''}${project.label ? ' project-has-label' : ''}`
    );
    if (project.cardClass) card.classList.add(project.cardClass);
    if (project.statusDescription) card.classList.add('project-field-test');
    const top = element('div', 'project-top');
    const badge = project.label ? element('span', 'project-badge', project.label) : null;
    if (badge) top.append(badge);
    top.append(element('span', `project-status${(project.status === 'TESTIMISEL' || project.statusDescription) ? ' project-status-testing' : ''}${(placeholder || project.status === 'TULEKUL') ? ' project-status-upcoming' : ''}`, project.status));
    const preview = element('div', 'project-preview-area');
    if (project.image) {
      const image = element('img', 'project-preview');
      if (project.imageClass) image.classList.add(project.imageClass);
      image.src = project.image;
      image.alt = project.alt;
      image.loading = 'lazy';
      image.decoding = 'async';
      preview.append(image);
    } else {
      preview.classList.add('project-preview-empty');
      preview.setAttribute('aria-hidden', 'true');
    }
    const projectId = element(project.secretUrl ? 'a' : 'span', `project-id${project.secretUrl ? ' project-secret-link' : ''}`, project.id);
    if (project.secretUrl) {
      projectId.href = project.secretUrl;
      projectId.target = '_blank';
      projectId.rel = 'noopener noreferrer';
    }
    if (project.secretUrl) {
      const secretMeta = element('div', 'project-secret-meta');
      secretMeta.append(projectId);
      if (badge) secretMeta.append(badge);
      top.prepend(secretMeta);
      card.append(top, element('h3', '', project.name), preview);
    } else {
      card.append(projectId, top, element('h3', '', project.name), preview);
    }
    if (project.description) card.append(element('p', '', project.description));
    if (project.statusDescription) card.append(element('p', 'project-test-note', project.statusDescription));
    if (project.url) {
      const action = element('a', 'project-link', project.actionLabel || 'VAATA PROJEKTI →');
      action.href = project.url;
      card.append(action);
    }
    fragment.append(card);
  }
  grid.replaceChildren(fragment);
})();

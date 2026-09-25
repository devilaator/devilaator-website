(() => {
  'use strict';
  // Tulevastele projektidele lisa lehe link alles siis, kui projektileht on olemas.
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
<<<<<<< Updated upstream
      id: 'PROJECT_03', name: 'KILBIHALDUS', label: 'WEB • APP', status: 'TESTIMISEL',
      description: 'Elektripaigaldise digitaalne kaart sinu taskus. Kilbid, grupid, toiteahelad, dokumendid ja hooldus ühes kohas.'
=======
      id: 'PROJECT_03',
      name: 'KILBIHALDUS',
      label: 'WEB • APP',
      status: 'TESTIMISEL',
      description: 'Kas ei tea, kus mis asub või kust toide tuleb? Appi võta Kilbihaldus - elektripaigaldise digitaalne kaart sinu taskus. Kilbid, grupid, toiteahelad, dokumendid ning hooldus ühes kohas. Kogu objekti elektripaigaldisest selge ülevaade otse ekraanilt.',
      image: 'img/kilbihaldus-clean.png',
      alt: 'Kilbihaldus'
>>>>>>> Stashed changes
    },
    
      {
        id: 'PROJECT_04',
        name: 'ELVA POKSIKLUBI',
        status: 'TULEKUL',
        description: 'Veebileht ja klubihaldussüsteem treeningute, liikmete, broneeringute ning väikese e-poega.',
        image: 'img/elva-poksiklubi.png',
        alt: 'Vanad poksikindad poksiringi nurgas'
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
    const placeholder = !project.url;
    const card = element(
      'article',
      `project-card${placeholder ? ' project-placeholder' : ''}${project.label ? ' project-has-label' : ''}`
    );
    const top = element('div', 'project-top');
    if (project.label) top.append(element('span', 'project-badge', project.label));
    top.append(element('span', `project-status${project.status === 'TESTIMISEL' ? ' project-status-testing' : ''}${placeholder ? ' project-status-upcoming' : ''}`, project.status));
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
    card.append(element('span', 'project-id', project.id), top, element('h3', '', project.name), preview);
    if (project.description) card.append(element('p', '', project.description));
    if (project.url) {
      const action = element('a', 'project-link', 'VAATA PROJEKTI →');
      action.href = project.url;
      card.append(action);
    }
    fragment.append(card);
  }
  grid.replaceChildren(fragment);
})();

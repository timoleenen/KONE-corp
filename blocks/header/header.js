import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

function buildSubMenuContainer(ulElement) {
  const parentLi = ulElement.parentElement;
  const subMenuContainerDiv = document.createElement('div');
  subMenuContainerDiv.classList.add('submenu-container');
  const subMenuDiv = document.createElement('div');
  subMenuDiv.classList.add('submenu');

  // Create left linkinfo div and populate with p elements
  const leftDiv = document.createElement('div');
  leftDiv.classList.add('link-info');
  ulElement.querySelectorAll('li > p:nth-child(2)').forEach((linkInfoTextP) => {
    const linkInfoBlockDiv = document.createElement('div');
    linkInfoBlockDiv.classList.add('link-info-block', 'hide'); // TODO: add logic to show when parent link hovered
    const linkInfoTitleP = document.createElement('p');
    linkInfoTitleP.classList.add('link-info-block-title');
    linkInfoTitleP.textContent = 'Link Title';
    linkInfoBlockDiv.append(linkInfoTitleP);
    linkInfoTextP.classList.add('link-info-block-text');
    linkInfoBlockDiv.append(linkInfoTextP);
    leftDiv.append(linkInfoBlockDiv);
  });

  // Create right submenu div and populate with ul
  const rightDiv = document.createElement('div');
  rightDiv.classList.add('submenu-block');
  ulElement.classList.add('navigation-list-item', 'level-2');

  // For each anchor element in the list item, embed a span with class 'link-content'
  ulElement.querySelectorAll('li > p > a').forEach((anchor) => {
    const spanElement = document.createElement('span');
    spanElement.classList.add('link-content');
    // Add a span to the spanElement and embed an svg element in the new span
    const spanIcon = document.createElement('span');
    const svgIcon = document.createElement('svg');
    svgIcon.setAttribute('viewBox', '0 0 1024 1024');
    const arrowElement = document.createElement('path');
    arrowElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    arrowElement.setAttribute('d', 'M512 128c-282.3 0 -512 229.7 -512 512 0 282.3 229.7 512 512 512 282.3 0 512 -229.7 512 -512 0 -282.3 -229.7 -512 -512 -512zm0 938.7c-235.3 0 -426.7 -191.4 -426.7 -426.7 0 -235.3 191.4 -426.7 426.7 -426.7 235.3 0 426.7 191.4 426.7 426.7 0 235.3 -191.4 426.7 -426.7 426.7zm306.5 -411.2c-6.4 16.4 -22.2 27.1 -39.7 27.2h-266.9 -266.6c-23.6 0 -42.7 -19.1 -42.7 -42.7s19.1 -42.7 42.7 -42.7h266.6 157.6l-174.2 -160.4c-3.9 -3.7 -5.6 -4.4 -5.6 -4.4 0.3 0.1 0.8 0.2 1.2 0.3l-61.3 -55.7c21.3 -23.5 44.2 -29 59.7 -29.6 15.9 -0.6 40 3.7 64.5 27.2l253.9 233.9c12.9 11.9 17.2 30.5 10.8 46.9zm-214.8 88.6l0.5 0.6 -5.9 5.6c0 0 -102.6 92.5 -102.6 92.5 -0.3 0.3 -0.7 0.6 -1 0.9 -3.2 3.1 -5 3.8 -5 3.8 0.3 -0.1 0.8 -0.2 1.2 -0.3l-61.3 55.7c21.3 23.4 44.2 29 59.7 29.6 0.8 0 1.7 0.1 2.6 0 15.8 0 38.4 -4.9 61.4 -26.7l102.8 -92.7 -18.7 -20.7c0 -0.4 19.3 20.1 19.3 20.1l88.5 -83.1h-126.3l-15.2 14.7zm32.4 46.9l-8.8 -9.8c0 0 8.9 9.4 8.8 9.8z');
    svgIcon.append(arrowElement);
    spanIcon.append(svgIcon);
    spanElement.append(spanIcon);
    const titleSpanElement = document.createElement('span');
    titleSpanElement.textContent = anchor.textContent;
    anchor.textContent = '';
    spanElement.append(titleSpanElement);
    anchor.append(spanElement);
  });

  // For each list item in the ul element add a class of navigation-list-item and level-3
  ulElement.querySelectorAll(':scope > li > ul').forEach((ul) => {
    ul.classList.add('navigation-list-item', 'level-3');
  });

  rightDiv.append(ulElement);

  subMenuDiv.append(leftDiv);
  subMenuDiv.append(rightDiv);

  subMenuContainerDiv.append(subMenuDiv);

  // Create submenu close div
  const subMenuCloseDiv = document.createElement('div');
  subMenuCloseDiv.classList.add('submenu-close');
  const subMenuCloseButton = document.createElement('button');
  subMenuCloseButton.classList.add('submenu-close-button', 'icon-scroll_up');
  subMenuCloseButton.ariaLabel = 'Close submenu';
  subMenuCloseDiv.append(subMenuCloseButton);
  subMenuContainerDiv.append(subMenuCloseDiv);

  // Add container to parent li
  parentLi.append(subMenuContainerDiv);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  // Select the first unordered list of navSections
  const ul = navSections.querySelector('ul');
  ul.classList.add('site-menu');
  // For each list item in the element add a class of navigation-list-item and check for children
  // and add event listener
  ul.querySelectorAll(':scope > li').forEach((li) => {
    li.classList.add('navigation-list-item', 'level-1');
    if (li.querySelector('ul')) {
      li.classList.add('has-children');
      li.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = li.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          li.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
      // Get the unordered list element and surround it in a div
      const ulElement = li.querySelector('ul');
      buildSubMenuContainer(ulElement);
    }
  });

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  /*
  toggleMenu(nav, navSections, isDesktop.matches);
*/
  toggleMenu(nav, navSections, false);
  /*
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));
*/
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, false));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}

document.addEventListener('DOMContentLoaded', () => {
  const dropdowns = document.querySelectorAll('[data-dropdown]');
  const menu = document.querySelector('.header .menu');

  if (menu) {
    const currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
    const sectionPath = ['/sluzby/', '/clanky/', '/prirucky/']
      .find((path) => currentPath.startsWith(path));
    const activePath = sectionPath || currentPath;

    Array.from(menu.children).forEach((item) => {
      const link = item.matches('a')
        ? item
        : item.querySelector(':scope > [data-dropdown-trigger]');

      if (!link) return;

      const linkPath = new URL(link.href, window.location.origin).pathname
        .replace(/\/index\.html$/, '/');

      link.removeAttribute('aria-current');
      if (linkPath === activePath) link.setAttribute('aria-current', 'page');
    });
  }

  const syncOpenDropdownState = () => {
    menu?.classList.toggle(
      'has-open-dropdown',
      Boolean(document.querySelector('[data-dropdown].is-open'))
    );
  };

  const positionSubmenu = (dropdown) => {
    const trigger = dropdown.querySelector('[data-dropdown-trigger]');
    const submenu = dropdown.querySelector('[data-dropdown-menu]');
    if (!trigger || !submenu) return;

    if (!window.matchMedia('(max-width: 900px)').matches) {
      submenu.style.removeProperty('--submenu-top');
      submenu.style.removeProperty('--submenu-left');
      submenu.style.removeProperty('--submenu-width');
      submenu.style.removeProperty('--submenu-max-height');
      return;
    }

    const gap = 8;
    const edge = 10;
    const triggerRect = trigger.getBoundingClientRect();
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const viewportWidth = window.visualViewport?.width || window.innerWidth;
    const width = Math.min(320, viewportWidth - edge * 2);
    const left = Math.min(
      viewportWidth - width - edge,
      Math.max(edge, triggerRect.left + triggerRect.width / 2 - width / 2)
    );
    const roomBelow = viewportHeight - triggerRect.bottom - gap - edge;
    const roomAbove = triggerRect.top - gap - edge;
    const openAbove = roomBelow < 180 && roomAbove > roomBelow;
    const maxHeight = Math.max(120, Math.min(420, openAbove ? roomAbove : roomBelow));
    const top = openAbove
      ? Math.max(edge, triggerRect.top - gap - maxHeight)
      : triggerRect.bottom + gap;

    submenu.style.setProperty('--submenu-top', `${Math.round(top)}px`);
    submenu.style.setProperty('--submenu-left', `${Math.round(left)}px`);
    submenu.style.setProperty('--submenu-width', `${Math.round(width)}px`);
    submenu.style.setProperty('--submenu-max-height', `${Math.round(maxHeight)}px`);
  };

  const closeDropdown = (dropdown) => {
    dropdown.classList.remove('is-open');
    dropdown.querySelector('[data-dropdown-trigger]')?.setAttribute('aria-expanded', 'false');
    syncOpenDropdownState();
  };

  const closeOtherDropdowns = (currentDropdown) => {
    dropdowns.forEach((dropdown) => {
      if (dropdown !== currentDropdown) closeDropdown(dropdown);
    });
  };

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector('[data-dropdown-trigger]');
    const menu = dropdown.querySelector('[data-dropdown-menu]');

    if (!trigger || !menu) return;

    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');

    const close = () => closeDropdown(dropdown);
    const toggle = (force) => {
      const shouldOpen = typeof force === 'boolean' ? force : !dropdown.classList.contains('is-open');
      if (shouldOpen) closeOtherDropdowns(dropdown);
      dropdown.classList.toggle('is-open', shouldOpen);
      trigger.setAttribute('aria-expanded', String(shouldOpen));
      if (shouldOpen) positionSubmenu(dropdown);
      syncOpenDropdownState();
    };

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggle();
    });

    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        close();
      }
    });

    dropdown.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        close();
        trigger.focus();
      }
    });
  });

  document.addEventListener('click', (event) => {
    dropdowns.forEach((dropdown) => {
      if (!dropdown.contains(event.target)) closeDropdown(dropdown);
    });
  });

  const repositionOpenDropdown = () => {
    document.querySelectorAll('[data-dropdown].is-open').forEach(positionSubmenu);
  };

  window.addEventListener('resize', repositionOpenDropdown);
  window.visualViewport?.addEventListener('resize', repositionOpenDropdown);
  window.addEventListener('scroll', repositionOpenDropdown, { passive: true });
});

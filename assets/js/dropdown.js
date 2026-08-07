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
});

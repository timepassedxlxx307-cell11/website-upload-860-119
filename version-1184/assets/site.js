(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    const activate = (index) => {
      current = index;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => activate(index));
    });

    if (slides.length > 1) {
      window.setInterval(() => {
        activate((current + 1) % slides.length);
      }, 5600);
    }
  }

  const forms = document.querySelectorAll('[data-filter-form]');
  forms.forEach((form) => {
    const section = form.closest('section') || document;
    const list = section.querySelector('[data-filter-list]');
    const emptyState = section.querySelector('[data-empty-state]');
    if (!list) {
      return;
    }

    const cards = Array.from(list.children);
    const controls = Array.from(form.querySelectorAll('[data-filter]'));

    const applyFilter = () => {
      const values = controls.reduce((acc, control) => {
        acc[control.getAttribute('data-filter')] = control.value.trim().toLowerCase();
        return acc;
      }, {});
      let visible = 0;

      cards.forEach((card) => {
        const text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category')
        ].join(' ').toLowerCase();
        const keywordOk = !values.keyword || text.includes(values.keyword);
        const yearOk = !values.year || (card.getAttribute('data-year') || '').toLowerCase() === values.year;
        const categoryOk = !values.category || (card.getAttribute('data-category') || '').toLowerCase() === values.category;
        const show = keywordOk && yearOk && categoryOk;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    };

    controls.forEach((control) => {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    });
  });
})();

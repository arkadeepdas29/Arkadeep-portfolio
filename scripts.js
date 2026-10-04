const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav-links');
const navigationLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('[data-section]');
const revealElements = document.querySelectorAll('.reveal');
const parallaxElements = document.querySelectorAll('[data-parallax]');
const modal = document.querySelector('[data-modal]');
const modalTitle = document.querySelector('[data-modal-title]');
const modalDescription = document.querySelector('[data-modal-description]');
const projectButtons = document.querySelectorAll('.project-hit');
const closeModalButtons = document.querySelectorAll('[data-close-modal]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const brand = document.querySelector('.site-header .brand');
const brandMark = brand?.querySelector('.brand-mark');
const brandName = brand?.querySelector('.brand-name');
const brandMarkImage = document.querySelector('.site-header .brand-mark img');
const aboutMark = document.querySelector('.about-mark');
const aboutMarkImage = aboutMark?.querySelector('img');
let portraitTransition;

const setMenuState = (isOpen) => {
    if (!menuToggle || !navigation) {
        return;
    }

    menuToggle.setAttribute('aria-expanded', String(isOpen));
    navigation.classList.toggle('is-open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
};

const setModalState = (isOpen, projectTitle = '', projectDescription = '') => {
    if (!modal) {
        return;
    }

    modal.classList.toggle('is-open', isOpen);
    modal.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('modal-open', isOpen);
    if (isOpen) {
        modalTitle.textContent = projectTitle;
        modalDescription.textContent = projectDescription;
        modal.querySelector('.modal-close').focus();
    }
};

if (menuToggle && navigation) {
    menuToggle.addEventListener('click', () => {
        setMenuState(menuToggle.getAttribute('aria-expanded') !== 'true');
    });
    navigationLinks.forEach((link) => link.addEventListener('click', () => setMenuState(false)));
}

if (revealElements.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    revealElements.forEach((element) => revealObserver.observe(element));
} else {
    revealElements.forEach((element) => element.classList.add('reveal-active'));
}

const updateScrollState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    updatePortraitTransition();
    if (!reduceMotion) {
        parallaxElements.forEach((element) => {
            const speed = Number(element.dataset.parallax);
            const offset = Math.min(window.scrollY * speed, 120);
            element.style.transform = `translate3d(0, ${offset}px, 0)`;
        });
    }
};

const updatePortraitTransition = () => {
    if (!brandMark || !brandName || !brandMarkImage || !aboutMark || !aboutMarkImage) {
        return;
    }

    const start = brandMarkImage.getBoundingClientRect();
    const target = aboutMarkImage.getBoundingClientRect();
    const transitionStart = window.innerHeight;
    const transitionEnd = window.innerHeight * .32;
    const progress = Math.max(0, Math.min(1, (transitionStart - target.top) / (transitionStart - transitionEnd)));

    if (progress === 0 || progress === 1) {
        aboutMark.classList.remove('is-transitioning');
        if (progress === 0) {
            brandMark.classList.remove('is-transitioning');
            brandMark.style.opacity = '';
            brandMark.style.transform = '';
            brandMark.style.backgroundColor = '';
            brandName.style.opacity = '';
            brandName.style.transform = '';
            brandMarkImage.style.opacity = '';
        } else {
            brandMark.classList.add('is-transitioning');
            brandMark.style.opacity = '0';
            brandMark.style.transform = 'translate3d(0, -.75rem, 0)';
            brandMark.style.backgroundColor = 'transparent';
            brandName.style.opacity = '0';
            brandName.style.transform = 'translate3d(-110%, 0, 0)';
            brandMarkImage.style.opacity = '0';
        }
        portraitTransition?.remove();
        portraitTransition = null;
        return;
    }

    if (!portraitTransition) {
        portraitTransition = brandMarkImage.cloneNode(true);
        portraitTransition.className = 'portrait-transition';
        document.body.append(portraitTransition);
    }

    const left = start.left + (target.left - start.left) * progress;
    const top = start.top + (target.top - start.top) * progress;
    const width = start.width + (target.width - start.width) * progress;
    const height = start.height + (target.height - start.height) * progress;

    portraitTransition.style.height = `${height}px`;
    portraitTransition.style.left = `${left}px`;
    portraitTransition.style.opacity = progress === 1 ? '0' : '1';
    portraitTransition.style.top = `${top}px`;
    portraitTransition.style.width = `${width}px`;
    portraitTransition.classList.toggle('is-complete', progress === 1);
    brandMark.style.opacity = `${1 - progress}`;
    brandMark.classList.add('is-transitioning');
    brandMark.style.transform = `translate3d(0, ${-progress * .75}rem, 0)`;
    brandMark.style.backgroundColor = 'transparent';
    brandName.style.opacity = `${1 - progress}`;
    brandName.style.transform = `translate3d(${-progress * 110}%, 0, 0)`;
    brandMarkImage.style.opacity = '0';
    aboutMark.classList.toggle('is-transitioning', progress < 1);
};

window.addEventListener('scroll', updateScrollState, { passive: true });
updateScrollState();

if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                navigationLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
            }
        });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach((section) => sectionObserver.observe(section));
}

projectButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const project = button.closest('.project');
        setModalState(true, project.dataset.project, project.dataset.description);
    });
});
closeModalButtons.forEach((button) => button.addEventListener('click', () => setModalState(false)));
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        setMenuState(false);
        setModalState(false);
    }
});

if (playReelButton && reelStatus) {
    playReelButton.addEventListener('click', () => {
        playReelButton.classList.toggle('is-playing');
        const isPlaying = playReelButton.classList.contains('is-playing');
        playReelButton.querySelector('span').textContent = isPlaying ? 'Ⅱ' : '▶';
        reelStatus.textContent = isPlaying ? 'Preview mode · add your showreel source to play' : 'Showreel placeholder · replace with your video';
    });
}

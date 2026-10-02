import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const COLORS = {
  blue: 0x00f3ff,
  purple: 0xbc13fe,
  magenta: 0xff00ff,
  cyan: 0x00f3ff,
};

class Portfolio {
  constructor() {
    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };
    this.init();
    this.initThreeJS();
    this.initCursor();
    this.initScrollEffects();
    this.initAmbientAnimations();
    this.initScrollAnimations();
    this.initForms();
    this.initMobileMenu();
    this.initThemeToggle();
    this.initMagneticButtons();
    this.initSkillCards();
    this.initProjectCards();
    this.initCarousels();
    this.initTypingAnimation();
    this.initActiveNavSpy();
    this.initCookieConsent();
    this.initSoundToggle();
  }

  init() {
    document.body.classList.add('loaded');
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;

    const hideLoading = () => {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        loadingScreen.remove();
      }, 700);
    };

    if (document.readyState === 'complete') {
      hideLoading();
    } else {
      window.addEventListener('load', hideLoading);
    }

    setTimeout(hideLoading, 5000);
  }

  initThreeJS() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: COLORS.blue,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 500;
    const starsPosArray = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) {
      starsPosArray[i] = (Math.random() - 0.5) * 40;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPosArray, 3));
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: COLORS.purple,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const starsMesh = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starsMesh);

    const sphereGeo = new THREE.IcosahedronGeometry(1.5, 2);
    const sphereMat = new THREE.MeshBasicMaterial({ color: COLORS.blue, wireframe: true, transparent: true, opacity: 0.08 });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(4, 1, -2);
    scene.add(sphere);

    const gridHelper = new THREE.GridHelper(30, 30, COLORS.blue, COLORS.purple);
    gridHelper.position.y = -3;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.15;
    scene.add(gridHelper);

    const cubesGroup = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const size = Math.random() * 0.3 + 0.1;
      const geo = new THREE.BoxGeometry(size, size, size);
      const mat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? COLORS.blue : COLORS.purple, wireframe: true, transparent: true, opacity: 0.3 });
      const cube = new THREE.Mesh(geo, mat);
      cube.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 5);
      cube.userData = { speed: Math.random() * 0.5 + 0.2, offset: Math.random() * Math.PI * 2, baseY: cube.position.y };
      cubesGroup.add(cube);
    }
    scene.add(cubesGroup);

    camera.position.z = 5;

    window.addEventListener('mousemove', (event) => {
      this.targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    const clock = new THREE.Clock();
    let animationFrame = 0;
    let lastFrameTime = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animate = (time) => {
      if (document.hidden) return;
      if (time - lastFrameTime >= 1000 / 30) {
        lastFrameTime = time;
        const elapsedTime = clock.getElapsedTime();
        particlesMesh.rotation.y = elapsedTime * 0.05;
        starsMesh.rotation.y = elapsedTime * 0.02;
        sphere.rotation.x = elapsedTime * 0.1;
        sphere.rotation.y = elapsedTime * 0.15;
        cubesGroup.children.forEach((cube) => {
          cube.rotation.x = elapsedTime * cube.userData.speed * 0.6;
          cube.rotation.y = elapsedTime * cube.userData.speed * 0.9;
          cube.position.y = cube.userData.baseY + Math.sin(elapsedTime * cube.userData.speed + cube.userData.offset) * 0.18;
        });
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;
        particlesMesh.rotation.y += this.mouse.x * 0.02;
        starsMesh.rotation.x += this.mouse.y * 0.01;
        renderer.render(scene, camera);
      }
      animationFrame = requestAnimationFrame(animate);
    };

    const syncAnimation = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      if (document.hidden) return;
      if (reducedMotion.matches) {
        renderer.render(scene, camera);
        return;
      }
      lastFrameTime = 0;
      animationFrame = requestAnimationFrame(animate);
    };
    document.addEventListener('visibilitychange', syncAnimation);
    reducedMotion.addEventListener('change', syncAnimation);
    syncAnimation();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  initCursor() {
    const cursor = document.getElementById('cursor');
    const cursorDot = document.getElementById('cursor-dot');
    if (!cursor || !cursorDot) return;
    let cursorX = 0;
    let cursorY = 0;

    window.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      cursor.style.transform = `translate(${cursorX - 16}px, ${cursorY - 16}px)`;
      cursorDot.style.transform = `translate(${cursorX - 4}px, ${cursorY - 4}px)`;
    });

    document.querySelectorAll('a, button, .skill-card, .project-card, .cert-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.transform = `translate(${cursorX - 16}px, ${cursorY - 16}px) scale(1.5)`;
        cursor.style.borderColor = '#bc13fe';
        cursor.style.backgroundColor = 'rgba(188,19,254,0.1)';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.transform = `translate(${cursorX - 16}px, ${cursorY - 16}px) scale(1)`;
        cursor.style.borderColor = '#00f3ff';
        cursor.style.backgroundColor = 'transparent';
      });
    });
  }

  initScrollEffects() {
    const navbar = document.getElementById('navbar');
    const progress = document.getElementById('scroll-progress');
    const backToTop = document.getElementById('back-to-top');
    let framePending = false;

    const update = () => {
      if (framePending) return;
      framePending = true;
      requestAnimationFrame(() => {
        framePending = false;
        const scrollTop = window.scrollY;
        if (navbar) {
          const isScrolled = scrollTop > 100;
          navbar.classList.toggle('bg-black/80', isScrolled);
          navbar.classList.toggle('backdrop-blur-xl', isScrolled);
          navbar.classList.toggle('border-b', isScrolled);
          navbar.classList.toggle('border-white/10', isScrolled);
        }
        if (progress) {
          const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          progress.style.transform = `scaleX(${scrollHeight > 0 ? scrollTop / scrollHeight : 0})`;
        }
        if (backToTop) {
          const isVisible = scrollTop > 500;
          backToTop.classList.toggle('opacity-0', !isVisible);
          backToTop.classList.toggle('pointer-events-none', !isVisible);
        }
      });
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    backToTop?.addEventListener('click', () => {
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      window.scrollTo({ top: 0, behavior });
    });
  }

  initAmbientAnimations() {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const animatedElements = hero.querySelectorAll('.animate-gradient-x, .animate-ping, .animate-pulse, .animate-bounce');
    if (!animatedElements.length) return;

    const observer = new IntersectionObserver(([entry]) => {
      const playState = entry.isIntersecting ? 'running' : 'paused';
      animatedElements.forEach(element => {
        element.style.animationPlayState = playState;
      });
    });
    observer.observe(hero);
  }

  initActiveNavSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.remove('text-neon-blue');
            if (link.getAttribute('href') === '#' + entry.target.id) {
              link.classList.add('text-neon-blue');
            }
          });
        }
      });
    }, { rootMargin: '-40% 0px -60% 0px', threshold: 0 });

    sections.forEach(section => observer.observe(section));
  }

  initScrollAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set('section, .skill-card, .project-card, .cert-card, .timeline-item, #avatar-placeholder', {
        opacity: 1,
        clearProps: 'transform',
      });
      return;
    }

    gsap.utils.toArray('section').forEach((section, i) => {
      if (i === 0) return;
      gsap.fromTo(section, { opacity: 0, y: 80 }, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          end: 'top 15%',
          toggleActions: 'play none none reverse',
        }
      });
    });

    gsap.utils.toArray('.skill-card').forEach((card, i) => {
      gsap.fromTo(card, { opacity: 0, y: 40, rotationX: 15 }, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.7,
        delay: i * 0.04,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        }
      });
    });

    gsap.utils.toArray('.project-card').forEach((card, i) => {
      gsap.fromTo(card, { opacity: 0, scale: 0.92, y: 40 }, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.9,
        delay: i * 0.08,
        ease: 'elastic.out(1, 0.75)',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        }
      });
    });

    gsap.utils.toArray('.cert-card').forEach((card, i) => {
      gsap.fromTo(card, { opacity: 0, x: -60, rotationY: 10 }, {
        opacity: 1,
        x: 0,
        rotationY: 0,
        duration: 0.9,
        delay: i * 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        }
      });
    });

    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
      gsap.fromTo(item, { opacity: 0, x: i % 2 === 0 ? -60 : 60 }, {
        opacity: 1,
        x: 0,
        duration: 0.9,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        }
      });
    });

    gsap.utils.toArray('.hero-title span').forEach((span, i) => {
      gsap.fromTo(span, { opacity: 0, y: 60, rotationX: 15 }, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 1.2,
        delay: i * 0.2,
        ease: 'power4.out',
      });
    });

    const avatar = document.getElementById('avatar-placeholder');
    if (avatar) {
      gsap.fromTo(avatar, { opacity: 0, scale: 0.8, rotation: -10 }, {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 1.5,
        delay: 0.5,
        ease: 'elastic.out(1, 0.6)',
      });
    }
  }

  initForms() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    let csrfToken = '';
    fetch('php/contact.php', { method: 'GET', headers: { 'Accept': 'application/json' }, credentials: 'same-origin' })
      .then(res => res.json())
      .then(data => { if (data.csrf_token) csrfToken = data.csrf_token; })
      .catch(() => {});

    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('border-red-400');
        const error = document.getElementById(`${input.id}-error`);
        if (error) error.classList.add('hidden');
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let hasError = false;

      const name = form.querySelector('#name');
      const email = document.getElementById('email');
      const phone = document.getElementById('phone');
      const subject = document.getElementById('subject');
      const message = document.getElementById('message');
      const nameErr = document.getElementById('name-error');
      const emailErr = document.getElementById('email-error');
      const phoneErr = document.getElementById('phone-error');
      const subjectErr = document.getElementById('subject-error');
      const messageErr = document.getElementById('message-error');
      if (!name.value.trim()) {
        name.classList.add('border-red-400');
        if (nameErr) nameErr.classList.remove('hidden');
        hasError = true;
      }
      if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.classList.add('border-red-400');
        if (emailErr) emailErr.classList.remove('hidden');
        hasError = true;
      }
      if (phone.value.trim() && !/^[+]?[\d\s()-]{7,20}$/.test(phone.value.trim())) {
        phone.classList.add('border-red-400');
        if (phoneErr) phoneErr.classList.remove('hidden');
        hasError = true;
      }
      if (!subject.value.trim()) {
        subject.classList.add('border-red-400');
        if (subjectErr) subjectErr.classList.remove('hidden');
        hasError = true;
      }
      if (!message.value.trim()) {
        message.classList.add('border-red-400');
        if (messageErr) messageErr.classList.remove('hidden');
        hasError = true;
      }
      if (hasError) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Sending...';
      submitBtn.disabled = true;

      try {
        const formData = new FormData(form);
        const headers = { 'X-Requested-With': 'XMLHttpRequest' };
        if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;
        const response = await fetch('php/contact.php', {
          method: 'POST',
          headers,
          body: formData,
          credentials: 'same-origin',
        });
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('Server returned an unexpected response. Please ensure the PHP backend is running.');
        }
        const result = await response.json();
        if (result.success) {
          this.showToast('Message sent successfully! We will get back to you soon.', 'success');
          form.reset();
        } else {
          throw new Error(result.message || 'Failed to send message');
        }
      } catch (error) {
        this.showToast(error.message || 'Something went wrong. Please try again.', 'error');
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-8 right-8 px-6 py-4 rounded-xl glass-card z-50 transform translate-y-20 opacity-0 transition-all duration-500 flex items-center gap-3`;
    if (type === 'success') {
      toast.classList.add('border-green-400/50');
      toast.innerHTML = `<i class="fas fa-check-circle text-green-400 text-xl"></i><span class="text-sm">${message}</span>`;
    } else {
      toast.classList.add('border-red-400/50');
      toast.innerHTML = `<i class="fas fa-exclamation-circle text-red-400 text-xl"></i><span class="text-sm">${message}</span>`;
    }
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-20', 'opacity-0');
    });
    setTimeout(() => {
      toast.classList.add('translate-y-20', 'opacity-0');
      setTimeout(() => toast.remove(), 500);
    }, 5000);
  }

  initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.add('hidden');
      });
    });
  }

  initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const icon = toggle.querySelector('i');
      if (document.body.classList.contains('dark')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      }
    });
  }

  initMagneticButtons() {
    const buttons = document.querySelectorAll('.magnetic-btn');
    buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  initSkillCards() {
    const cards = document.querySelectorAll('.skill-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        card.style.transform = `perspective(1000px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) scale(1.05)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      });
    });
  }

  initProjectCards() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        card.style.transform = `perspective(1000px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) scale(1.02)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      });
    });
  }

  initCarousels() {
    document.querySelectorAll('.project-card').forEach(card => {
      const prevBtn = card.querySelector('.carousel-prev');
      const nextBtn = card.querySelector('.carousel-next');
      if (!prevBtn || !nextBtn) return;

      const slides = [
        { icon: 'fa-cloud', gradient: 'from-neon-blue/20 to-neon-purple/20', color: 'text-neon-blue' },
        { icon: 'fa-server', gradient: 'from-neon-purple/20 to-neon-magenta/20', color: 'text-neon-purple' },
        { icon: 'fa-database', gradient: 'from-neon-cyan/20 to-neon-blue/20', color: 'text-neon-cyan' },
      ];

      let currentSlide = 0;
      const iconContainer = card.querySelector('.absolute.inset-0.flex.items-center.justify-center');

      const updateSlide = () => {
        const slide = slides[currentSlide];
        if (iconContainer) {
          iconContainer.innerHTML = `<i class="fas ${slide.icon} text-6xl ${slide.color}/30"></i>`;
        }
      };

      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlide();
      });

      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlide();
      });
    });
  }

  initTypingAnimation() {
    const el = document.getElementById('typing-text');
    if (!el) return;
    const phrases = ['Full Stack Developer', 'Cloud Architect', 'Cybersecurity Expert', 'DevOps Engineer'];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = phrases[0];
      return;
    }
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const type = () => {
      const current = phrases[phraseIndex];
      if (isDeleting) {
        el.textContent = current.substring(0, charIndex - 1);
        charIndex--;
      } else {
        el.textContent = current.substring(0, charIndex + 1);
        charIndex++;
      }
      let typeSpeed = isDeleting ? 50 : 100;
      if (!isDeleting && charIndex === current.length) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 500;
      }
      setTimeout(type, typeSpeed);
    };
    setTimeout(type, 1500);
  }

  initCookieConsent() {
    const banner = document.getElementById('cookie-consent');
    if (!banner) return;
    if (localStorage.getItem('cookiesAccepted')) {
      banner.style.display = 'none';
      return;
    }
    banner.classList.remove('translate-y-full', 'opacity-0');
    document.getElementById('cookie-accept').addEventListener('click', () => {
      localStorage.setItem('cookiesAccepted', 'true');
      banner.classList.add('translate-y-full', 'opacity-0');
      setTimeout(() => banner.remove(), 500);
    });
  }

  initSoundToggle() {
    const btn = document.getElementById('sound-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      btn.classList.toggle('text-neon-blue');
      btn.classList.toggle('text-gray-400');
    });
  }

}

document.addEventListener('DOMContentLoaded', () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => new Portfolio());
  } else {
    setTimeout(() => new Portfolio(), 1);
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });
}

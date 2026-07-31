/* =========================================================
   HaloAiStudios — site script
   - Canvas particle field (replaces the old broken Three.js code,
     which referenced a #threejs-canvas element that no longer exists)
   - Intro sequence controller (the coded "intro video")
   - Nav / mobile menu / scroll helpers
   ========================================================= */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Smooth scroll ---------- */
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
    }
}

/* ---------- Placeholder checkout (wire up Stripe/etc. here) ---------- */
function checkout(plan) {
    alert(`Checking out ${plan} plan... (placeholder — connect this to your payment provider)`);
}

/* ---------- Apply live app links from config.js ---------- */
function applyAppLinks() {
    if (typeof HALO_CONFIG === 'undefined' || !HALO_CONFIG.apps) return;
    document.querySelectorAll('[data-app]').forEach((el) => {
        const key = el.getAttribute('data-app');
        const url = HALO_CONFIG.apps[key];
        if (url) el.setAttribute('href', url);
    });
}

/* ---------- Mobile menu ---------- */
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('hamburger-icon');
    const hamburger = document.getElementById('hamburger');
    if (!menu) return;
    const isHidden = menu.classList.toggle('hidden');
    if (icon) icon.textContent = isHidden ? '☰' : '✕';
    if (hamburger) hamburger.setAttribute('aria-expanded', String(!isHidden));
}

/* ---------- Intro sequence ("intro video") ---------- */
let introTimers = [];

function finishIntro() {
    introTimers.forEach(clearTimeout);
    introTimers = [];
    const overlay = document.getElementById('intro-overlay');
    if (overlay) overlay.classList.add('intro-done');
    try { sessionStorage.setItem('halo_intro_played', '1'); } catch (e) { /* storage unavailable */ }
}

function playIntro() {
    const overlay = document.getElementById('intro-overlay');
    if (!overlay) return;

    let alreadyPlayed = false;
    try { alreadyPlayed = sessionStorage.getItem('halo_intro_played') === '1'; } catch (e) { /* ignore */ }

    if (alreadyPlayed || REDUCED_MOTION) {
        finishIntro();
        return;
    }

    const videoUrl = (typeof HALO_CONFIG !== 'undefined' && HALO_CONFIG.introVideoUrl)
        ? HALO_CONFIG.introVideoUrl.trim()
        : '';

    if (videoUrl) {
        playVideoIntro(overlay, videoUrl);
    } else {
        playCodedIntro();
    }
}

/* Coded intro — the default. Halo-ring reveal -> tagline scene -> fade out. */
function playCodedIntro() {
    const scene1 = document.getElementById('scene1');
    const scene2 = document.getElementById('scene2');
    if (!scene1 || !scene2) {
        finishIntro();
        return;
    }

    introTimers.push(setTimeout(() => {
        scene1.classList.remove('active');
        scene2.classList.add('active');
    }, 2800));

    introTimers.push(setTimeout(finishIntro, 5600));
}

/* Real video intro — used only once HALO_CONFIG.introVideoUrl is filled in. */
function playVideoIntro(overlay, videoUrl) {
    document.getElementById('scene1')?.classList.remove('active');

    const scene = document.createElement('div');
    scene.className = 'scene active';
    scene.id = 'scene-video';
    scene.style.padding = '0';

    const video = document.createElement('video');
    video.src = videoUrl;
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.style.position = 'absolute';
    video.style.inset = '0';
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';

    video.addEventListener('ended', finishIntro);
    video.addEventListener('error', () => {
        // Bad or unreachable video URL — fall back to the coded intro rather than a black screen
        scene.remove();
        playCodedIntro();
    });

    scene.appendChild(video);
    overlay.appendChild(scene);

    // Safety net in case autoplay is blocked or the video never fires "ended"
    introTimers.push(setTimeout(finishIntro, 15000));
}

/* ---------- Navbar scroll state ---------- */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    const onScroll = () => {
        navbar.classList.toggle('navbar-scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* ---------- Ambient particle field ---------- */
function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, particles;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function makeParticles(count) {
        return Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 1.6 + 0.4,
            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.15,
            a: Math.random() * 0.5 + 0.2
        }));
    }

    resize();
    const count = window.innerWidth < 768 ? 70 : 140;
    particles = makeParticles(count);

    window.addEventListener('resize', () => {
        resize();
        particles = makeParticles(count);
    });

    function draw() {
        ctx.clearRect(0, 0, width, height);
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 215, 0, ${p.a})`;
            ctx.fill();
        }
        if (!REDUCED_MOTION) requestAnimationFrame(draw);
    }

    draw();
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    applyAppLinks();
    playIntro();
    initNavbarScroll();

    const hamburger = document.getElementById('hamburger');
    if (hamburger) hamburger.addEventListener('click', toggleMobileMenu);

    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});

/* ══════════════════════════════════════════════════════
   💖 CONFIG — PERSONALIZE EVERYTHING HERE
   ══════════════════════════════════════════════════════
   1) Put your files in the folders:
        images/jace.jpg, images/memory1.jpg ... memory5.jpg,
        images/gallery1.jpg ... gallery4.jpg
        music/our-song.mp3
   2) Edit the paths below. Leave '' to keep placeholders.
   ══════════════════════════════════════════════════════ */
const PHOTOS = {
    hero: 'jace.jpg',           // Jace's portrait (top circle)
    polaroids: [                       // Memory Lane stack (5)
        'memory1.jpg',
        'memory2.jpg',
        'memory3.jpg',
        'memory4.jpg',
        'memory5.jpg',
    ],
    gallery: [                         // Finale gallery (4)
        'gallery1.jpg',
        'gallery2.jpg',
        'gallery3.jpg',
        'gallery4.jpg',
    ],
};

const MUSIC_FILE = 'our-song.mp3'; // Your song (mp3/m4a/ogg/wav)
const MUSIC_VOLUME = 0.6;                // 0.0 – 1.0
/* ══════════════════════════════════════════════════════ */

const state = {
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    musicPlaying: false,
    audioCtx: null,
    musicIntervals: [],
    candlesOut: 0,
    totalCandles: 5,
    typewriterStarted: false,
    scratchComplete: false,
};

/* ============================================
   PHOTO LOADER (reads the CONFIG above)
   ============================================ */
function applyPhotos() {
    if (PHOTOS.hero) {
        const img = document.getElementById('heroImg');
        img.src = PHOTOS.hero;
        img.hidden = false;
        const placeholder = document.getElementById('photoPlaceholder');
        if (placeholder) placeholder.remove();
    }
    PHOTOS.polaroids.forEach((src, i) => {
        if (!src) return;
        const slot = document.querySelector(`.polaroid-image[data-slot="polaroid-${i}"]`);
        if (!slot) return;
        slot.style.backgroundImage = `url('${src}')`;
        slot.innerHTML = '';
    });
    PHOTOS.gallery.forEach((src, i) => {
        if (!src) return;
        const slot = document.querySelector(`.gallery-item[data-slot="gallery-${i}"]`);
        if (!slot) return;
        slot.style.backgroundImage = `url('${src}')`;
        slot.innerHTML = '';
    });
}
applyPhotos();

/* ============================================
   CUSTOM CURSOR
   ============================================ */
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');

document.addEventListener('mousemove', (e) => {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
    cursor.style.left = (e.clientX - 10) + 'px';
    cursor.style.top = (e.clientY - 10) + 'px';
    cursorTrail.style.left = (e.clientX - 4) + 'px';
    cursorTrail.style.top = (e.clientY - 4) + 'px';
});

document.querySelectorAll('button, a, .reason-card, .polaroid, .scratch-canvas, .wish-card, .gallery-item').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

/* ============================================
   PARTICLE SYSTEM (Hearts + Stars)
   ============================================ */
const pCanvas = document.getElementById('particleCanvas');
const pCtx = pCanvas.getContext('2d');
const particles = [];

function resizeParticleCanvas() {
    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;
}
resizeParticleCanvas();
window.addEventListener('resize', resizeParticleCanvas);

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * pCanvas.width;
        this.y = Math.random() * pCanvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5 - 0.3;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.type = Math.random() > 0.6 ? 'heart' : 'star';
        this.hue = Math.random() > 0.5 ? 330 : 270;
    }
    update() {
        const dx = state.mouseX - this.x;
        const dy = state.mouseY - this.y;
        if (Math.sqrt(dx * dx + dy * dy) < 150) { this.x -= dx * 0.01; this.y -= dy * 0.01; }
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < -10 || this.x > pCanvas.width + 10 || this.y < -10 || this.y > pCanvas.height + 10) {
            this.reset();
            this.y = pCanvas.height + 10;
        }
    }
    draw() {
        pCtx.save();
        pCtx.globalAlpha = this.opacity;
        if (this.type === 'heart') this.drawHeart(this.x, this.y, this.size * 2);
        else this.drawStar(this.x, this.y, this.size);
        pCtx.restore();
    }
    drawHeart(x, y, s) {
        pCtx.fillStyle = `hsl(${this.hue},100%,70%)`;
        pCtx.shadowColor = pCtx.fillStyle;
        pCtx.shadowBlur = 10;
        pCtx.beginPath();
        pCtx.moveTo(x, y + s / 4);
        pCtx.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + s / 4);
        pCtx.bezierCurveTo(x - s / 2, y + s / 2, x, y + s * 0.7, x, y + s * 0.9);
        pCtx.bezierCurveTo(x, y + s * 0.7, x + s / 2, y + s / 2, x + s / 2, y + s / 4);
        pCtx.bezierCurveTo(x + s / 2, y, x, y, x, y + s / 4);
        pCtx.fill();
    }
    drawStar(x, y, s) {
        pCtx.fillStyle = `hsl(${this.hue + 60},80%,85%)`;
        pCtx.shadowColor = pCtx.fillStyle;
        pCtx.shadowBlur = 8;
        pCtx.beginPath();
        for (let i = 0; i < 5; i++) {
            const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            i === 0 ? pCtx.moveTo(x + Math.cos(a) * s, y + Math.sin(a) * s)
                    : pCtx.lineTo(x + Math.cos(a) * s, y + Math.sin(a) * s);
        }
        pCtx.closePath();
        pCtx.fill();
    }
}
for (let i = 0; i < 100; i++) particles.push(new Particle());

(function animateParticles() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
})();

/* ============================================
   MUSIC PLAYER (your song + built-in fallback)
   ============================================ */
const musicToggle = document.getElementById('musicToggle');
const musicIcon = document.getElementById('musicIcon');
const bgMusic = document.getElementById('bgMusic');
bgMusic.volume = MUSIC_VOLUME;

let useFileMusic = MUSIC_FILE !== '';
if (useFileMusic) bgMusic.src = MUSIC_FILE;
bgMusic.addEventListener('error', () => { useFileMusic = false; }, { once: true });

function setPlayingUI(on) {
    state.musicPlaying = on;
    musicIcon.textContent = on ? '🎶' : '🎵';
    musicToggle.classList.toggle('playing', on);
}

function toggleMusic() {
    if (state.musicPlaying) { stopMusic(); return; }
    if (useFileMusic) {
        bgMusic.play()
            .then(() => setPlayingUI(true))
            .catch(() => { useFileMusic = false; startSynthMusic(); setPlayingUI(true); });
    } else {
        startSynthMusic();
        setPlayingUI(true);
    }
}

function stopMusic() {
    if (useFileMusic) bgMusic.pause();
    else stopSynthMusic();
    setPlayingUI(false);
}
musicToggle.addEventListener('click', toggleMusic);

/* Built-in lo-fi melody (only used if no music file found) */
function startSynthMusic() {
    if (state.audioCtx) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    state.audioCtx = ctx;
    if (ctx.state === 'suspended') ctx.resume();

    const master = ctx.createGain();
    master.gain.value = 0.15;
    master.connect(ctx.destination);

    const pad = (f) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
        o.type = 'sine'; o.frequency.value = f;
        fl.type = 'lowpass'; fl.frequency.value = 800;
        g.gain.value = 0.08;
        o.connect(fl); fl.connect(g); g.connect(master);
        o.start();
        return { o, g };
    };

    const chords = [
        [261.63, 329.63, 392.00, 493.88],
        [220.00, 261.63, 329.63, 392.00],
        [174.61, 220.00, 261.63, 329.63],
        [196.00, 246.94, 293.66, 349.23],
    ];
    let pads = [], ci = 0;
    const playChord = () => {
        pads.forEach(p => {
            p.g.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
            setTimeout(() => { try { p.o.stop(); } catch (e) {} }, 1200);
        });
        pads = chords[ci].map(pad);
        ci = (ci + 1) % chords.length;
    };
    playChord();

    const notes = [523.25, 587.33, 659.25, 523.25, 493.88, 440.00, 392.00, 440.00];
    let ni = 0;
    const playNote = () => {
        const o = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
        o.type = 'triangle'; o.frequency.value = notes[ni];
        fl.type = 'lowpass'; fl.frequency.value = 1200;
        g.gain.setValueAtTime(0.06, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
        o.connect(fl); fl.connect(g); g.connect(master);
        o.start(); o.stop(ctx.currentTime + 2);
        ni = (ni + 1) % notes.length;
    };
    playNote();

    state.musicIntervals = [setInterval(playChord, 4000), setInterval(playNote, 2000)];
}

function stopSynthMusic() {
    state.musicIntervals.forEach(clearInterval);
    state.musicIntervals = [];
    if (state.audioCtx && state.audioCtx.state !== 'closed') state.audioCtx.close().catch(() => {});
    state.audioCtx = null;
}

/* ============================================
   SPLASH SCREEN (music starts inside gesture)
   ============================================ */
const splash = document.getElementById('splashScreen');
splash.addEventListener('click', () => {
    if (splash.classList.contains('hidden')) return;
    splash.classList.add('hidden');
    document.body.style.overflow = '';
    if (!state.musicPlaying) toggleMusic();
    startCountdown();
    observeSections();
});
document.body.style.overflow = 'hidden';

/* ============================================
   COUNTDOWN + BIRTHDAY MOMENT
   ============================================ */
let birthdayTriggered = false;

function startCountdown() {
    const target = new Date('2026-09-16T00:00:00').getTime();
    const rings = document.querySelectorAll('.countdown-ring');

    function update() {
        const now = Date.now();
        let diff = target - now;
        if (diff <= 0 && !birthdayTriggered) triggerBirthdayMoment();
        if (diff < 0) diff = 0;

        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        document.getElementById('cdDays').textContent = String(d).padStart(2, '0');
        document.getElementById('cdHours').textContent = String(h).padStart(2, '0');
        document.getElementById('cdMins').textContent = String(m).padStart(2, '0');
        document.getElementById('cdSecs').textContent = String(s).padStart(2, '0');

        const C = 283;
        rings[0].querySelector('.ring-progress').style.strokeDashoffset = C - (d / 365) * C;
        rings[1].querySelector('.ring-progress').style.strokeDashoffset = C - (h / 24) * C;
        rings[2].querySelector('.ring-progress').style.strokeDashoffset = C - (m / 60) * C;
        rings[3].querySelector('.ring-progress').style.strokeDashoffset = C - (s / 60) * C;
    }
    update();
    setInterval(update, 1000);
}

function triggerBirthdayMoment() {
    birthdayTriggered = true;
    const dateEl = document.querySelector('.hero-date');
    if (dateEl) { dateEl.textContent = '✨ Today is the day! ✨'; dateEl.classList.add('birthday-date'); }
    const badge = document.querySelector('.photo-badge');
    if (badge) badge.classList.add('badge-celebrate');
    launchHeroFireworks();
    burstHearts();
    setTimeout(showBirthdayToast, 2500);
}

function launchHeroFireworks() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:5;pointer-events:none;';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let sparks = [];
    let frame = 0;
    function explode(x, y, hue) {
        for (let i = 0; i < 80; i++) {
            const a = (Math.PI * 2 / 80) * i;
            const sp = 2 + Math.random() * 4;
            sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, decay: 0.012 + Math.random() * 0.01, hue: hue + Math.random() * 40 - 20, size: 2 + Math.random() * 2 });
        }
    }
    (function animate() {
        if (frame > 300) { canvas.remove(); return; }
        ctx.fillStyle = 'rgba(5,5,16,0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (frame % 40 === 0) explode(Math.random() * canvas.width, Math.random() * canvas.height * 0.5 + 50, Math.random() * 60 + 300);
        sparks = sparks.filter(p => p.life > 0);
        sparks.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.life -= p.decay;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue},100%,70%,${p.life})`;
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;
        });
        frame++;
        requestAnimationFrame(animate);
    })();
}

function burstHearts() {
    const rect = document.getElementById('countdown').getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const emojis = ['💖', '💕', '✨', '🎉', '💝'];
    for (let i = 0; i < 30; i++) {
        const el = document.createElement('div');
        el.textContent = emojis[i % emojis.length];
        el.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;font-size:${20 + Math.random() * 20}px;pointer-events:none;z-index:9999;transition:all 2s cubic-bezier(.25,.46,.45,.94);`;
        document.body.appendChild(el);
        const a = (Math.PI * 2 / 30) * i;
        const dist = 200 + Math.random() * 200;
        requestAnimationFrame(() => {
            el.style.left = (cx + Math.cos(a) * dist) + 'px';
            el.style.top = (cy + Math.sin(a) * dist) + 'px';
            el.style.opacity = '0';
            el.style.transform = `scale(${1 + Math.random()}) rotate(${Math.random() * 360}deg)`;
        });
        setTimeout(() => el.remove(), 2200);
    }
}

function showBirthdayToast() {
    const toast = document.createElement('div');
    toast.className = 'birthday-toast';
    toast.innerHTML = `<div class="toast-inner">🎂 Happy Birthday, Jace! 🎂<br><span class="toast-sub">It's officially your day 💖</span></div>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'opacity 1s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 1000);
    }, 4500);
}

/* ============================================
   SCROLL OBSERVER
   ============================================ */
function observeSections() {
    const sections = document.querySelectorAll('.section');
    const dots = document.querySelectorAll('.nav-dots .dot');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            const id = entry.target.id;
            dots.forEach(d => d.classList.toggle('active', d.dataset.section === id));
            if (id === 'typewriter' && !state.typewriterStarted) {
                state.typewriterStarted = true;
                setTimeout(startTypewriter, 400);
            }
        });
    }, { threshold: 0.1 });
    sections.forEach(s => observer.observe(s));
}

/* ============================================
   TYPEWRITER
   ============================================ */
function startTypewriter() {
    const lines = [
        "Today the world celebrates the day you were born,",
        "and my heart celebrates the day I found you.",
        "",
        "Twenty-one looks absolutely stunning on you, Jace.",
        "Every moment with you feels like a beautiful dream",
        "that I never want to wake up from.",
        "",
        "You are my sunshine on cloudy days,",
        "my calm in every storm,",
        "and the reason I believe in forever.",
        "",
        "Happy Birthday, my love. Here's to us. 🥂"
    ];
    const container = document.getElementById('typewriterText');
    const cursorEl = document.getElementById('typewriterCursor');
    const signature = document.getElementById('letterSignature');

    container.textContent = '';
    let lineIdx = 0, charIdx = 0, currentText = '';

    (function typeChar() {
        if (lineIdx >= lines.length) {
            cursorEl.style.display = 'none';
            signature.classList.add('visible');
            return;
        }
        const line = lines[lineIdx];
        if (charIdx < line.length) {
            currentText += line[charIdx++];
            container.textContent = currentText;
            setTimeout(typeChar, 50 + Math.random() * 30);
        } else {
            currentText += '\n';
            container.textContent = currentText;
            lineIdx++; charIdx = 0;
            setTimeout(typeChar, line === '' ? 300 : 500);
        }
    })();
}

/* ============================================
   CANDLE BLOW BUTTON
   ============================================ */
const blowBtn = document.getElementById('blowBtn');
const blowHint = document.getElementById('blowHint');
const birthdayCake = document.getElementById('birthdayCake');
const BLOW_DEFAULT = '🌬️ Blow Out the Candles!';
const HINT_DEFAULT = 'Close your eyes, make a wish... then press the button!';
const PLAYFUL = [
    "Whoosh! 💨 One candle down...",
    "Keep going, your wish is loading... 😄",
    "Halfway there! Wish harder! ✨",
    "Almost... don't stop now! 🌬️",
    "Last one... make it count! 💫"
];

blowBtn.addEventListener('click', () => {
    if (blowBtn.disabled) return;
    blowBtn.disabled = true;
    blowBtn.textContent = '🌬️ Blowing...';
    blowHint.textContent = 'Making your wish come true...';

    const candles = Array.from(document.querySelectorAll('.candle'));
    candles.forEach((candle, i) => {
        setTimeout(() => {
            extinguishCandle(candle);
            spawnPuff(candle);
            wiggleCake();
            blowHint.textContent = PLAYFUL[i] || blowHint.textContent;
        }, 500 + i * 650);
    });
    setTimeout(() => { blowBtn.textContent = '🎉 Wish Made!'; }, 500 + candles.length * 650);
});

function spawnPuff(candle) {
    const wrapper = candle.querySelector('.flame-wrapper');
    if (!wrapper) return;
    const puff = document.createElement('span');
    puff.className = 'puff';
    puff.textContent = '💨';
    wrapper.appendChild(puff);
    setTimeout(() => puff.remove(), 1200);
}

function wiggleCake() {
    birthdayCake.classList.remove('cake-wiggle');
    void birthdayCake.offsetWidth;
    birthdayCake.classList.add('cake-wiggle');
}

function extinguishCandle(candle) {
    const flame = candle.querySelector('.flame');
    const glow = candle.querySelector('.flame-glow');
    if (!flame || flame.classList.contains('out')) return;
    flame.classList.add('out');
    glow.classList.add('out');
    state.candlesOut++;
    if (state.candlesOut >= state.totalCandles) setTimeout(triggerBlowSurprise, 800);
}

/* ============================================
   FIREWORKS FINALE
   ============================================ */
const blowSurprise = document.getElementById('blowSurprise');
let fwSession = 0;
let surpriseTimer = null;

blowSurprise.addEventListener('click', () => blowSurprise.classList.remove('active'));

function triggerBlowSurprise() {
    blowSurprise.classList.add('active');
    startCinematicFireworks();
    if (surpriseTimer) clearTimeout(surpriseTimer);
    surpriseTimer = setTimeout(() => blowSurprise.classList.remove('active'), 10000);
}

function startCinematicFireworks() {
    const session = ++fwSession;
    const canvas = document.getElementById('fireworksCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const rockets = [];
    const sparks = [];

    class Rocket {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height;
            this.targetY = Math.random() * (canvas.height * 0.5) + 100;
            this.speed = 5 + Math.random() * 3;
            this.hue = Math.random() * 360;
            this.alive = true;
            this.trail = [];
        }
        update() {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 10) this.trail.shift();
            this.y -= this.speed;
            if (this.y <= this.targetY) { this.alive = false; this.explode(); }
        }
        explode() {
            const n = 100 + Math.random() * 50;
            for (let i = 0; i < n; i++) {
                const a = (Math.PI * 2 / n) * i + Math.random() * 0.5;
                const sp = 2 + Math.random() * 4;
                sparks.push({ x: this.x, y: this.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, decay: 0.01 + Math.random() * 0.01, hue: this.hue + Math.random() * 60 - 30, size: 2 + Math.random() * 3, sparkle: Math.random() > 0.7 });
            }
        }
        draw() {
            if (this.trail.length) {
                ctx.beginPath();
                ctx.moveTo(this.trail[0].x, this.trail[0].y);
                this.trail.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.strokeStyle = `hsla(${this.hue},100%,70%,.5)`;
                ctx.lineWidth = 3;
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${this.hue},100%,80%)`;
            ctx.fill();
        }
    }

    let frame = 0;
    (function animate() {
        if (session !== fwSession || !blowSurprise.classList.contains('active')) return;
        ctx.fillStyle = 'rgba(5,5,16,0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (frame % 40 === 0) rockets.push(new Rocket());
        for (let i = rockets.length - 1; i >= 0; i--) {
            rockets[i].update(); rockets[i].draw();
            if (!rockets[i].alive) rockets.splice(i, 1);
        }
        for (let i = sparks.length - 1; i >= 0; i--) {
            const p = sparks[i];
            p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= p.decay;
            if (p.life <= 0) { sparks.splice(i, 1); continue; }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            if (p.sparkle && Math.random() > 0.9) { ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 20; }
            else { ctx.fillStyle = `hsla(${p.hue},100%,70%,${p.life})`; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10; }
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        frame++;
        requestAnimationFrame(animate);
    })();
}

/* ============================================
   POLAROIDS
   ============================================ */
const polaroids = document.querySelectorAll('.polaroid');
const polaroidCounter = document.getElementById('polaroidCounter');
let activePolaroid = 0;
let polaroidSwiped = false;

function showPolaroid(index) {
    polaroids.forEach((p, i) => {
        p.classList.toggle('active', i === index);
        p.style.zIndex = i === index ? 10 : 5 - Math.abs(i - index);
    });
    activePolaroid = index;
    polaroidCounter.textContent = `${index + 1} / ${polaroids.length}`;
}
showPolaroid(0);

document.getElementById('prevPolaroid').addEventListener('click', () => showPolaroid((activePolaroid - 1 + polaroids.length) % polaroids.length));
document.getElementById('nextPolaroid').addEventListener('click', () => showPolaroid((activePolaroid + 1) % polaroids.length));
polaroids.forEach((p, i) => {
    p.addEventListener('click', () => {
        if (polaroidSwiped) return;
        showPolaroid(i !== activePolaroid ? i : (activePolaroid + 1) % polaroids.length);
    });
});

const stackEl = document.getElementById('polaroidStack');
let touchStartX = 0;
stackEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
stackEl.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 50) {
        polaroidSwiped = true;
        setTimeout(() => { polaroidSwiped = false; }, 80);
        showPolaroid(diff < 0 ? (activePolaroid + 1) % polaroids.length : (activePolaroid - 1 + polaroids.length) % polaroids.length);
    }
}, { passive: true });

/* ============================================
   REASONS GRID
   ============================================ */
document.querySelectorAll('.reason-card').forEach(card => {
    card.querySelector('.reason-back p').textContent = card.dataset.reason;
    card.addEventListener('click', () => card.classList.toggle('flipped'));
});

/* ============================================
   SCRATCH-OFF
   ============================================ */
const scratchCanvas = document.getElementById('scratchCanvas');
const scratchCtx = scratchCanvas.getContext('2d');
let scratchReady = false;
let scratchDown = false;
let scratchLast = { x: 0, y: 0 };

function sizeScratchCanvas() {
    const r = scratchCanvas.parentElement.getBoundingClientRect();
    scratchCanvas.width = Math.max(1, Math.round(r.width));
    scratchCanvas.height = Math.max(1, Math.round(r.height));
}

function drawFoil() {
    const w = scratchCanvas.width, h = scratchCanvas.height;
    const g = scratchCtx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#d4a017'); g.addColorStop(0.3, '#f5d76e');
    g.addColorStop(0.5, '#d4a017'); g.addColorStop(0.7, '#f5d76e');
    g.addColorStop(1, '#c49000');
    scratchCtx.globalCompositeOperation = 'source-over';
    scratchCtx.fillStyle = g;
    scratchCtx.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) {
        scratchCtx.fillStyle = `rgba(255,255,255,${Math.random() * 0.1})`;
        scratchCtx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    scratchCtx.fillStyle = 'rgba(0,0,0,0.2)';
    scratchCtx.font = 'bold 26px Quicksand, sans-serif';
    scratchCtx.textAlign = 'center';
    scratchCtx.fillText('✨ SCRATCH ME ✨', w / 2, h / 2);
}

function scratchPos(e) {
    const r = scratchCanvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: (cx - r.left) * (scratchCanvas.width / r.width),
        y: (cy - r.top) * (scratchCanvas.height / r.height)
    };
}

function scratchAt(x, y) {
    scratchCtx.globalCompositeOperation = 'destination-out';
    scratchCtx.beginPath();
    scratchCtx.arc(x, y, 35, 0, Math.PI * 2);
    scratchCtx.fill();
    if (scratchLast.x || scratchLast.y) {
        scratchCtx.beginPath();
        scratchCtx.moveTo(scratchLast.x, scratchLast.y);
        scratchCtx.lineTo(x, y);
        scratchCtx.lineWidth = 70;
        scratchCtx.lineCap = 'round';
        scratchCtx.stroke();
    }
    scratchLast = { x, y };
    scratchCtx.globalCompositeOperation = 'source-over';
    updateScratchPercent();
}

function updateScratchPercent() {
    const data = scratchCtx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height).data;
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] === 0) transparent++;
    const percent = Math.round((transparent / (data.length / 4)) * 100);
    document.getElementById('scratchPercent').textContent = `${percent}% revealed`;
    if (percent > 60 && !state.scratchComplete) {
        state.scratchComplete = true;
        scratchCanvas.style.transition = 'opacity 1s ease';
        scratchCanvas.style.opacity = '0';
        document.getElementById('scratchPercent').textContent = '🎉 Surprise revealed!';
    }
}

function initScratch() {
    sizeScratchCanvas();
    drawFoil();
    if (scratchReady) return;
    scratchReady = true;

    scratchCanvas.addEventListener('mousedown', e => { scratchDown = true; const p = scratchPos(e); scratchLast = p; scratchAt(p.x, p.y); });
    scratchCanvas.addEventListener('mousemove', e => { if (scratchDown) { const p = scratchPos(e); scratchAt(p.x, p.y); } });
    window.addEventListener('mouseup', () => { scratchDown = false; scratchLast = { x: 0, y: 0 }; });
    scratchCanvas.addEventListener('mouseleave', () => { scratchDown = false; scratchLast = { x: 0, y: 0 }; });
    scratchCanvas.addEventListener('touchstart', e => { e.preventDefault(); scratchDown = true; const p = scratchPos(e); scratchLast = p; scratchAt(p.x, p.y); }, { passive: false });
    scratchCanvas.addEventListener('touchmove', e => { e.preventDefault(); if (scratchDown) { const p = scratchPos(e); scratchAt(p.x, p.y); } }, { passive: false });
    scratchCanvas.addEventListener('touchend', () => { scratchDown = false; scratchLast = { x: 0, y: 0 }; });
}

function resetScratch() {
    state.scratchComplete = false;
    scratchCanvas.style.transition = 'none';
    scratchCanvas.style.opacity = '1';
    void scratchCanvas.offsetWidth;
    scratchCanvas.style.transition = '';
    document.getElementById('scratchPercent').textContent = '';
    sizeScratchCanvas();
    drawFoil();
}

const scratchObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { initScratch(); scratchObserver.disconnect(); }
}, { threshold: 0.2 });
scratchObserver.observe(document.getElementById('scratch'));

let scratchResizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(scratchResizeTimer);
    scratchResizeTimer = setTimeout(() => {
        if (scratchReady && !state.scratchComplete) { sizeScratchCanvas(); drawFoil(); }
    }, 300);
});

/* ============================================
   REPLAY
   ============================================ */
document.getElementById('replayBtn').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    state.typewriterStarted = false;
    document.getElementById('typewriterText').textContent = '';
    document.getElementById('typewriterCursor').style.display = 'inline-block';
    document.getElementById('letterSignature').classList.remove('visible');

    state.candlesOut = 0;
    document.querySelectorAll('.flame, .flame-glow').forEach(f => f.classList.remove('out'));
    blowBtn.disabled = false;
    blowBtn.textContent = BLOW_DEFAULT;
    blowHint.textContent = HINT_DEFAULT;

    document.querySelectorAll('.reason-card').forEach(c => c.classList.remove('flipped'));
    resetScratch();
});

/* ============================================
   KEYBOARD NAVIGATION
   ============================================ */
document.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const sections = ['hero', 'typewriter', 'cake', 'polaroids', 'reasons', 'wishes', 'scratch', 'finale'];
    const dots = document.querySelectorAll('.nav-dots .dot');
    let idx = 0;
    dots.forEach((d, i) => { if (d.classList.contains('active')) idx = i; });
    if (e.key === 'ArrowDown' && idx < sections.length - 1) document.getElementById(sections[idx + 1]).scrollIntoView({ behavior: 'smooth' });
    if (e.key === 'ArrowUp' && idx > 0) document.getElementById(sections[idx - 1]).scrollIntoView({ behavior: 'smooth' });
});

console.log('%c💖 Happy 21st Birthday, Jace Boniface! 💖', 'font-size:24px;color:#ff6b9d;font-family:cursive;');
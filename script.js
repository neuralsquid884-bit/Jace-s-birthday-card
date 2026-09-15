/* ═════════════════════════════════════════════════════
   💖 CONFIG — PERSONALIZE EVERYTHING HERE
   ══════════════════════════════════════════════════════ */
const PHOTOS = {
    hero: 'jace.jpg',           
    polaroids: [                       
        'memory1.jpg',
        'memory2.jpg',
        'memory3.jpg',
        'memory4.jpg',
        'memory5.jpg',
    ],
    gallery: [                         
        'gallery1.jpg',
        'gallery2.jpg',
        'gallery3.jpg',
        'gallery4.jpg',
    ],
};

const MUSIC_FILE = 'our-song.mp3'; 
const MUSIC_VOLUME = 0.6;                
/* ════════════════════════════════════════════════════ */

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
   PHOTO LOADER
   ============================================ */
function applyPhotos() {
    if (PHOTOS.hero) {
        const img = document.getElementById('heroImg');
        if(img) {
            img.src = PHOTOS.hero;
            img.hidden = false;
            const placeholder = document.getElementById('photoPlaceholder');
            if (placeholder) placeholder.remove();
        }
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
   CUSTOM CURSOR (Desktop Only)
   ============================================ */
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');

if (!('ontouchstart' in window)) {
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
} else {
    cursor.style.display = 'none';
    cursorTrail.style.display = 'none';
}

/* ============================================
   PARTICLE SYSTEM (Lightweight Background)
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
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3 - 0.1;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.type = Math.random() > 0.7 ? 'heart' : 'star';
        this.hue = Math.random() > 0.5 ? 330 : 270;
    }
    update() {
        const dx = state.mouseX - this.x;
        const dy = state.mouseY - this.y;
        if (Math.sqrt(dx * dx + dy * dy) < 100) { this.x -= dx * 0.005; this.y -= dy * 0.005; }
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
for (let i = 0; i < 60; i++) particles.push(new Particle());

(function animateParticles() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
})();

/* ============================================
   MUSIC PLAYER
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
    musicIcon.textContent = on ? '🎶' : '';
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
   SPLASH SCREEN
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
   COUNTDOWN + BIRTHDAY MOMENT (CSS ONLY - NO FREEZE)
   ============================================ */
let birthdayTriggered = false;

function startCountdown() {
    // PRODUCTION TIMER: Set to Jace's actual birthday
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
    
    // Update UI elements
    const dateEl = document.querySelector('.hero-date');
    if (dateEl) { 
        dateEl.textContent = '✨ Today is the day! ✨'; 
        dateEl.classList.add('birthday-date'); 
    }
    const badge = document.querySelector('.photo-badge');
    if (badge) badge.classList.add('badge-celebrate');
    
    // Launch lightweight CSS confetti
    launchCSSConfetti();
    
    // Show toast after a short delay
    setTimeout(showBirthdayToast, 2000);
}

function launchCSSConfetti() {
    const colors = ['#ff2d95', '#b44dff', '#ffd700', '#ff6b9d', '#ffffff'];
    const shapes = ['●', '■', '▲', '★', '💖'];
    
    for (let i = 0; i < 60; i++) {
        const confetti = document.createElement('div');
        confetti.textContent = shapes[Math.floor(Math.random() * shapes.length)];
        
        const startX = 50 + (Math.random() - 0.5) * 30; 
        const startY = 20 + Math.random() * 20;
        
        confetti.style.cssText = `
            position: fixed;
            left: ${startX}vw;
            top: ${startY}vh;
            font-size: ${12 + Math.random() * 16}px;
            color: ${colors[Math.floor(Math.random() * colors.length)]};
            pointer-events: none;
            z-index: 9998;
            opacity: 1;
            transition: all ${2 + Math.random() * 3}s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            text-shadow: 0 0 5px currentColor;
        `;
        
        document.body.appendChild(confetti);
        
        requestAnimationFrame(() => {
            const endX = startX + (Math.random() - 0.5) * 80;
            const endY = 80 + Math.random() * 30;
            const rotation = Math.random() * 720 - 360;
            
            confetti.style.left = `${endX}vw`;
            confetti.style.top = `${endY}vh`;
            confetti.style.opacity = '0';
            confetti.style.transform = `rotate(${rotation}deg) scale(0.5)`;
        });
        
        setTimeout(() => confetti.remove(), 5000);
    }
}

function showBirthdayToast() {
    const toast = document.createElement('div');
    toast.className = 'birthday-toast';
    toast.innerHTML = `<div class="toast-inner">🎂 Happy Birthday, Jace! <br><span class="toast-sub">It's officially your day 💖</span></div>`;
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
    "Keep going, your wish is loading... ",
    "Halfway there! Wish harder! ✨",
    "Almost... don't stop now! 🌬️",
    "Last one... make it count! "
];

blowBtn.addEventListener('click', () => {
    if (blowBtn.disabled) return;
    blowBtn.disabled = true;
    blowBtn.textContent = '💨 Blowing...';
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
   CANDLE BLOW SURPRISE (Lightweight CSS Confetti)
   ============================================ */
const blowSurprise = document.getElementById('blowSurprise');
let surpriseTimer = null;
let surpriseListenerAttached = false;

if (!surpriseListenerAttached) {
    blowSurprise.addEventListener('click', () => {
        blowSurprise.classList.remove('active');
        if (surpriseTimer) clearTimeout(surpriseTimer);
    });
    surpriseListenerAttached = true;
}

function triggerBlowSurprise() {
    blowSurprise.classList.add('active');
    launchCSSConfetti(); // Use lightweight confetti to prevent freeze
    if (surpriseTimer) clearTimeout(surpriseTimer);
    surpriseTimer = setTimeout(() => {
        blowSurprise.classList.remove('active');
    }, 8000);
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
        document.getElementById('scratchPercent').textContent = ' Surprise revealed!';
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
    
    birthdayTriggered = false;
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
const track = document.getElementById('track');
const dotsEl = document.getElementById('dots');
const captionEl = document.getElementById('caption');
const audio = document.getElementById('audio');
const soundStatus = document.getElementById('soundStatus');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
// const replayBtn = document.getElementById('replayBtn');


const slides = Array.from(track.querySelectorAll('.slide'));
let index = 0;

function setActive(i) {
    index = (i + slides.length) % slides.length;

    // Images dans un cercle : on affiche une seule photo à la fois
    slides.forEach((s, si) => {
        s.classList.toggle('is-active', si === index);
    });

    // Dots
    const dots = Array.from(dotsEl.children);
    dots.forEach((d, di) => d.classList.toggle('is-active', di === index));

    // Caption
    captionEl.textContent = slides[index].dataset.caption || `Photo ${index + 1}`;

    // Poème : afficher toutes les lignes (tout lire)
    revealPoemStep(10);
}



function buildDots() {
    dotsEl.innerHTML = '';
    slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === 0 ? ' is-active' : '');
        dot.addEventListener('click', () => setActive(i));
        dotsEl.appendChild(dot);
    });
}

function tryPlaySound() {
    if (!audio) return;
    soundStatus.textContent = 'Son : démarrage…';

    audio.loop = true;

    const p = audio.play();

    if (p && typeof p.then === 'function') {
        p.then(() => {
            soundStatus.textContent = 'Son : en lecture ✨';
        }).catch(() => {
            soundStatus.textContent = 'Son : bloqué (cliquez pour démarrer)';
        });
    } else {
        soundStatus.textContent = 'Son : en lecture ✨';
    }
}

// Slider auto
let timer = null;

function startAuto() {
    stopAuto();
    timer = setInterval(() => {
        const next = index + 1;
        setActive(next);

        // Poème : prolonger (recommencer le reveal sur chaque boucle)
        if (next % slides.length === 0) {
            renderPoem();
            // Afficher directement toutes les lignes (poème bien visible)
            revealPoemStep(10);
        }
    }, 5200);
}




function stopAuto() {
    if (timer) clearInterval(timer);
    timer = null;
}

prevBtn.addEventListener('click', () => {
    setActive(index - 1);
    startAuto();
});
nextBtn.addEventListener('click', () => {
    setActive(index + 1);
    startAuto();
});


// Poème d’amitié (noir/opaque) — à chaque cycle, on le re-révèle
const poemText = document.getElementById('poemText');
const poemLines = [
    "Mon ami(e),",
    "je te souhaite du fond du cœur d’être entouré(e) de paix, de chance et de belles nouvelles.",
    "Que chaque jour te rapproche de tes rêves et te donne le sourire.",
    "Merci d’être là, d’être toi — et surtout, ne doute jamais de ta valeur.",
    "Je suis fier/fière de toi, et je te garde dans mon cœur.",
    "Avec toute mon amitié sincère. ✨"
];


function renderPoem() {
    if (!poemText) return;
    poemText.innerHTML = '';
    // On affiche progressivement la poésie quand les photos défilent
    poemLines.forEach((line, i) => {
        const span = document.createElement('span');
        span.textContent = line;
        if (i !== poemLines.length - 1) span.innerHTML += '<br/>';
        span.className = 'poemLine';
        span.dataset.lineIndex = String(i);
        poemText.appendChild(span);
    });
    // Texte noir (sans gradient)
    poemText.classList.remove('gradient-text');

}

function revealPoemStep(step) {
    if (!poemText) return;
    const lines = Array.from(poemText.querySelectorAll('.poemLine'));
    // step: 0..2 (3 photos)
    const clamped = Math.max(-1, Math.min(2, step));
    lines.forEach((el, i) => {
        const shouldShow = i <= clamped; // 0..2 -> révèle 1 puis 2 puis 3 lignes (ou plus si besoin)
        el.style.opacity = shouldShow ? '1' : '0.15';
        // Pas de flou (pour éviter un rendu incertain)
        el.style.filter = 'blur(0px)';
        el.style.transition = 'opacity 1.2s ease, filter 1.2s ease';
    });
}

// UI Pages
const page1 = document.getElementById('page1');
const page2 = document.getElementById('page2');
const openBtn = document.getElementById('openBtn');

function showPage2() {
    if (page1) page1.hidden = true;
    if (page2) page2.hidden = false;

    if (audio) {
        audio.loop = true;
        // relance depuis le début à l’ouverture
        audio.currentTime = 0;
    }


    // initialiser seulement quand la page 2 est visible
    buildDots();
    setActive(0);
    renderPoem();
    revealPoemStep(-1);
    startAuto();

    // lance le son au moment de l'ouverture (autoplay souvent ok après un clic)
    tryPlaySound();
}

if (openBtn) {
    openBtn.addEventListener('click', () => {
        showPage2();
    });
}

// Fallback si audio bloqué : 1er geste utilisateur relance
const gestureHandler = () => {
    if (page2 && page2.hidden) return; // si pas encore ouvert, on attend le clic openBtn
    audio.currentTime = 0;
    tryPlaySound();
    window.removeEventListener('pointerdown', gestureHandler);
    window.removeEventListener('keydown', gestureHandler);
};
window.addEventListener('pointerdown', gestureHandler);
window.addEventListener('keydown', gestureHandler);
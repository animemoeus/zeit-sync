// ============================================
// TRANSLATIONS
// ============================================
const translations = {
    en: {
        pageTitle: 'Remote Sync: Jakarta - Germany',
        headerTitle: 'Remote Sync',
        headerSubtitle: 'Jakarta (WIB) ↔ Berlin (CET/CEST)',
        jakartaCity: 'Jakarta',
        jakartaLabel: 'Home Base',
        berlinCity: 'Berlin',
        berlinLabel: 'Remote Office',
        statusLabel: 'Status:',
        statusWorking: 'Work Hours',
        statusPersonal: 'Personal Time',
        statusNight: 'Night/Sleep',
        statusChecking: 'Checking...',
        meetingPlannerTitle: 'Meeting Planner',
        resetButton: 'Reset to Now',
        sliderLabel: 'Slide to see Berlin time at a specific Jakarta hour:',
        jakartaTime: 'Jakarta Time',
        berlinTime: 'Berlin Time',
        today: 'Today',
        yesterday: 'Yesterday',
        officeHours: 'Office Hours',
        afterHours: 'After Hours',
        summerDST: '☀ Summer Time (DST Active)',
        winterStandard: '❄ Standard Time',
        dstTooltipSummer: '5 hours difference with Jakarta',
        dstTooltipWinter: '6 hours difference with Jakarta',
        footerDST: 'Germany observes Daylight Saving Time (DST).',
        footerDiff: 'Time difference can be 5 or 6 hours.',
        checkingDST: 'Checking DST...',
        loading: 'Loading...'
    },
    id: {
        pageTitle: 'Remote Sync: Jakarta - Jerman',
        headerTitle: 'Remote Sync',
        headerSubtitle: 'Jakarta (WIB) ↔ Berlin (CET/CEST)',
        jakartaCity: 'Jakarta',
        jakartaLabel: 'Home Base',
        berlinCity: 'Berlin',
        berlinLabel: 'Remote Office',
        statusLabel: 'Status:',
        statusWorking: 'Jam Kerja',
        statusPersonal: 'Personal Time',
        statusNight: 'Malam/Tidur',
        statusChecking: 'Checking...',
        meetingPlannerTitle: 'Meeting Planner',
        resetButton: 'Reset ke Sekarang',
        sliderLabel: 'Geser untuk melihat waktu di Berlin saat jam tertentu di Jakarta:',
        jakartaTime: 'Waktu Jakarta',
        berlinTime: 'Waktu Berlin',
        today: 'Hari Ini',
        yesterday: 'Kemarin',
        officeHours: 'Jam Kerja',
        afterHours: 'Di Luar Jam Kerja',
        summerDST: '☀ Musim Panas (DST Aktif)',
        winterStandard: '❄ Waktu Standar',
        dstTooltipSummer: 'Selisih 5 jam dengan Jakarta',
        dstTooltipWinter: 'Selisih 6 jam dengan Jakarta',
        footerDST: 'Germany observes Daylight Saving Time (DST).',
        footerDiff: 'Perbedaan waktu bisa 5 atau 6 jam.',
        checkingDST: 'Checking DST...',
        loading: 'Loading...'
    }
};

// ============================================
// LANGUAGE MANAGEMENT
// ============================================
let currentLang = localStorage.getItem('language') || 'en';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    updateTranslations();
    updateClocks(); // Refresh to apply translations to dynamic content
}

function updateTranslations() {
    const t = translations[currentLang];
    
    // Update page title
    document.title = t.pageTitle;
    
    // Update elements with data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });
    
    // Update language toggle button
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.textContent = currentLang === 'en' ? 'ID' : 'EN';
        langBtn.title = currentLang === 'en' ? 'Switch to Indonesian' : 'Switch to English';
    }
}

function toggleLanguage() {
    setLanguage(currentLang === 'en' ? 'id' : 'en');
}

// ============================================
// CLOCK & TIMEZONE LOGIC
// ============================================
const zones = {
    jakarta: 'Asia/Jakarta',
    berlin: 'Europe/Berlin'
};

const workHours = {
    start: 9, // 9 AM
    end: 18   // 6 PM
};

// DOM Elements
const els = {
    jktTime: document.getElementById('jkt-time'),
    jktDate: document.getElementById('jkt-date'),
    jktStatus: document.getElementById('jkt-status'),
    deTime: document.getElementById('de-time'),
    deDate: document.getElementById('de-date'),
    deSeason: document.getElementById('de-season'),
    deStatus: document.getElementById('de-status'),
    deOffset: document.getElementById('de-offset'),
    slider: document.getElementById('planner-slider'),
    planJkt: document.getElementById('plan-jkt'),
    planJktDay: document.getElementById('plan-jkt-day'),
    planJktStatus: document.getElementById('plan-jkt-status'),
    planDe: document.getElementById('plan-de'),
    planDeDay: document.getElementById('plan-de-day'),
    planDeStatus: document.getElementById('plan-de-status')
};

let plannerOffsetMinutes = 0;
let isPlannerActive = false;

function getFormattedTime(date, timeZone) {
    return new Intl.DateTimeFormat('id-ID', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: isPlannerActive ? undefined : '2-digit',
        hour12: false
    }).format(date);
}

function getFormattedDate(date, timeZone) {
    return new Intl.DateTimeFormat('id-ID', {
        timeZone,
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }).format(date);
}

function getHour(date, timeZone) {
    const str = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: 'numeric',
        hour12: false
    }).format(date);
    return parseInt(str);
}

function getStatus(hour) {
    const t = translations[currentLang];
    const isWorking = hour >= workHours.start && hour < workHours.end;
    if (isWorking) {
        return {
            text: t.statusWorking,
            color: 'text-green-400',
            dot: 'bg-green-500',
            bg: 'bg-green-500/10',
            border: 'border-green-500/20'
        };
    } else if (hour >= 22 || hour < 6) {
        return {
            text: t.statusNight,
            color: 'text-indigo-400',
            dot: 'bg-indigo-500',
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/20'
        };
    } else {
        return {
            text: t.statusPersonal,
            color: 'text-slate-400',
            dot: 'bg-slate-500',
            bg: 'bg-slate-500/10',
            border: 'border-slate-500/20'
        };
    }
}

function updateClocks() {
    const t = translations[currentLang];
    const now = new Date();

    // Jakarta
    els.jktTime.innerText = getFormattedTime(now, zones.jakarta);
    els.jktDate.innerText = getFormattedDate(now, zones.jakarta);
    
    const jktHour = getHour(now, zones.jakarta);
    const jktStat = getStatus(jktHour);
    els.jktStatus.innerHTML = `<span class="w-2 h-2 rounded-full ${jktStat.dot} animate-pulse"></span> ${jktStat.text}`;
    els.jktStatus.className = `flex items-center gap-2 ${jktStat.color}`;

    // Berlin
    els.deTime.innerText = getFormattedTime(now, zones.berlin);
    els.deDate.innerText = getFormattedDate(now, zones.berlin);
    
    const deHour = getHour(now, zones.berlin);
    const deStat = getStatus(deHour);
    els.deStatus.innerHTML = `<span class="w-2 h-2 rounded-full ${deStat.dot} animate-pulse"></span> ${deStat.text}`;
    els.deStatus.className = `flex items-center gap-2 ${deStat.color}`;

    // Calculate Offset Dynamically (Handles DST)
    const jktDateObj = new Date(now.toLocaleString('en-US', { timeZone: zones.jakarta }));
    const deDateObj = new Date(now.toLocaleString('en-US', { timeZone: zones.berlin }));
    
    const deOffsetString = new Intl.DateTimeFormat('en-US', { timeZone: zones.berlin, timeZoneName: 'shortOffset' }).format(now);
    const offsetPart = deOffsetString.split('GMT')[1] || deOffsetString.split('UTC')[1];
    
    // Logic to detect DST (Summer Time) specifically for Germany
    let isDST = false;
    if (offsetPart && (offsetPart.includes('+2') || offsetPart.includes('+02'))) {
        isDST = true;
    }

    // Update UI with explicit DST info
    if(offsetPart) {
        const zoneName = isDST ? 'CEST' : 'CET';
        els.deOffset.innerText = `UTC ${offsetPart} • ${zoneName}`;
        
        if (isDST) {
            els.deSeason.innerHTML = `<span class="text-amber-300">${t.summerDST}</span>`;
            els.deSeason.title = t.dstTooltipSummer;
        } else {
            els.deSeason.innerHTML = `<span class="text-blue-300">${t.winterStandard}</span>`;
            els.deSeason.title = t.dstTooltipWinter;
        }
    }

    if (!isPlannerActive) {
        const currentTotalMinutes = (now.getHours() * 60) + now.getMinutes();
        els.slider.value = currentTotalMinutes;
        updatePlannerUI(now); 
    }
}

function updatePlannerUI(baseDate) {
    const t = translations[currentLang];
    const sliderVal = parseInt(els.slider.value);
    const hours = Math.floor(sliderVal / 60);
    const minutes = sliderVal % 60;

    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: zones.jakarta,
        year: 'numeric', month: 'numeric', day: 'numeric'
    }).formatToParts(baseDate);
    
    const y = parts.find(p => p.type === 'year').value;
    const m = parts.find(p => p.type === 'month').value;
    const d = parts.find(p => p.type === 'day').value;

    const jktNow = new Date(baseDate.toLocaleString('en-US', { timeZone: zones.jakarta }));
    const sliderDate = new Date(jktNow);
    sliderDate.setHours(hours, minutes, 0, 0);

    els.planJkt.innerText = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;
    
    const liveJkt = new Date(new Date().toLocaleString('en-US', { timeZone: zones.jakarta }));
    const liveDe = new Date(new Date().toLocaleString('en-US', { timeZone: zones.berlin }));
    const diffMs = liveJkt - liveDe;

    const berlinDate = new Date(sliderDate.getTime() - diffMs);
    
    const deH = berlinDate.getHours();
    const deM = berlinDate.getMinutes();
    els.planDe.innerText = `${deH.toString().padStart(2,'0')}:${deM.toString().padStart(2,'0')}`;

    // Update Jakarta status
    const jktStat = getStatus(hours);
    els.planJktStatus.innerHTML = jktStat.text;
    els.planJktStatus.className = `mt-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${jktStat.color} ${jktStat.bg} ${jktStat.border}`;

    // Update Berlin status
    const deStat = getStatus(deH);
    els.planDeStatus.innerHTML = deStat.text;
    els.planDeStatus.className = `mt-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${deStat.color} ${deStat.bg} ${deStat.border}`;

    if (berlinDate.getDate() !== sliderDate.getDate()) {
        els.planDeDay.innerText = t.yesterday;
    } else {
        els.planDeDay.innerText = t.today;
    }
    
    els.planJktDay.innerText = t.today;
}

function resetPlanner() {
    isPlannerActive = false;
    updateClocks();
}

// ============================================
// CURSOR EFFECT
// ============================================
class CursorEffect {
    constructor() {
        this.canvas = document.getElementById('cursor-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.hue = 200;
        this.glowOpacity = 0;
        this.targetGlowOpacity = 0;
        this.isMouseInside = false;
        this.lastMouseMoveTime = Date.now();
        this.fadeOutDelay = 2000; // Start fading after 2 seconds of inactivity
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseenter', () => this.handleMouseEnter());
        window.addEventListener('mouseleave', () => this.handleMouseLeave());
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.lastMouseMoveTime = Date.now();
        this.targetGlowOpacity = 1;
        this.isMouseInside = true;
        
        // Create new particles on mouse move (only when active)
        if (this.glowOpacity > 0.3) {
            for (let i = 0; i < 3; i++) {
                this.particles.push(new Particle(this.mouse.x, this.mouse.y, this.hue));
            }
        }
        
        // Cycle through hue for rainbow effect
        this.hue += 0.5;
        if (this.hue > 360) this.hue = 0;
    }
    
    handleMouseEnter() {
        this.isMouseInside = true;
        this.targetGlowOpacity = 1;
    }
    
    handleMouseLeave() {
        this.isMouseInside = false;
        this.targetGlowOpacity = 0;
    }
    
    animate() {
        // Clear with fade effect for trails
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Check for inactivity
        const timeSinceLastMove = Date.now() - this.lastMouseMoveTime;
        if (timeSinceLastMove > this.fadeOutDelay && this.isMouseInside) {
            this.targetGlowOpacity = 0;
        }
        
        // Smoothly interpolate glow opacity (slower = smoother)
        this.glowOpacity += (this.targetGlowOpacity - this.glowOpacity) * 0.05;
        
        // Draw gradient glow at cursor position (with fade effect)
        if (this.mouse.x && this.mouse.y && this.glowOpacity > 0.01) {
            const gradient = this.ctx.createRadialGradient(
                this.mouse.x, this.mouse.y, 0,
                this.mouse.x, this.mouse.y, 150
            );
            gradient.addColorStop(0, `hsla(${this.hue}, 100%, 60%, ${0.3 * this.glowOpacity})`);
            gradient.addColorStop(0.5, `hsla(${this.hue + 30}, 100%, 50%, ${0.1 * this.glowOpacity})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                this.mouse.x - 150, 
                this.mouse.y - 150, 
                300, 
                300
            );
        }
        
        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            this.particles[i].draw(this.ctx);
            
            if (this.particles[i].alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

class Particle {
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.hue = hue;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decay;
        if (this.size > 0.2) this.size -= 0.05;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = `hsl(${this.hue}, 100%, 60%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Set initial language
    setLanguage(currentLang);
    
    // Event Listeners
    els.slider.addEventListener('input', () => {
        isPlannerActive = true;
        updatePlannerUI(new Date());
    });
    
    // Start clock updates
    setInterval(updateClocks, 1000);
    updateClocks();
    
    // Initialize cursor effect
    new CursorEffect();
});

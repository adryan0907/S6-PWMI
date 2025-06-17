// Kiosk Animation and Interaction System
class KioskAnimations {
    constructor() {
        this.isIdle = true;
        this.idleTimer = null;
        this.currentHighlight = 0;
        this.contentBoxes = document.querySelectorAll('.content-box');
        this.handIcon = document.querySelector('.hand-icon');
        this.mainTitle = document.querySelector('.tournament-info h1');
        
        this.init();
    }

    init() {
        this.startIdleMode();
        this.addHoverEffects();
        this.createFloatingParticles();
        this.addTextCycling();
        this.addAttentionGrabbers();
        this.simulateHandDetection();
    }

    startIdleMode() {
        this.idleTimer = setInterval(() => {
            if (this.isIdle) {
                this.highlightNextSection();
            }
        }, 3000);
    }

    highlightNextSection() {
        this.contentBoxes.forEach(box => box.classList.remove('highlighted'));
        
        if (this.contentBoxes[this.currentHighlight]) {
            this.contentBoxes[this.currentHighlight].classList.add('highlighted');
        }
        
        this.currentHighlight = (this.currentHighlight + 1) % this.contentBoxes.length;
    }

    addHoverEffects() {
        this.contentBoxes.forEach((box, index) => {
            box.addEventListener('mouseenter', () => {
                this.isIdle = false;
                this.createRippleEffect(box);
            });

            box.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    this.isIdle = true;
                }, 2000);
            });
        });
    }

    createRippleEffect(element) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    createFloatingParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        document.body.appendChild(particleContainer);

        setInterval(() => {
            if (Math.random() > 0.7) {
                this.createParticle(particleContainer);
            }
        }, 1000);
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
        
        const emojis = ['✨', '🏘️', '👋', '🎉', '💫'];
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        
        container.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 5000);
    }

    addTextCycling() {
        const messages = [
            {
                dutch: "Ontdek Woensel Zuid door je hand te bewegen!",
                english: "Discover Woensel Zuid by moving your hand!"
            },
            {
                dutch: "Verken je buurt op een nieuwe manier!",
                english: "Explore your neighborhood in a new way!"
            },
            {
                dutch: "Interactieve ervaring - probeer het nu!",
                english: "Interactive experience - try it now!"
            }
        ];

        let currentMessage = 0;
        const dutchElement = document.querySelector('.main-cta');
        const englishElement = document.querySelector('.sub-cta');

        setInterval(() => {
            if (dutchElement && englishElement) {
                dutchElement.style.opacity = '0';
                englishElement.style.opacity = '0';
                
                setTimeout(() => {
                    dutchElement.textContent = messages[currentMessage].dutch;
                    englishElement.textContent = messages[currentMessage].english;
                    dutchElement.style.opacity = '1';
                    englishElement.style.opacity = '1';
                    
                    currentMessage = (currentMessage + 1) % messages.length;
                }, 500);
            }
        }, 4000);
    }

    addAttentionGrabbers() {
        setInterval(() => {
            if (this.isIdle && this.mainTitle) {
                this.mainTitle.classList.add('mega-pulse');
                setTimeout(() => {
                    this.mainTitle.classList.remove('mega-pulse');
                }, 1000);
            }
        }, 8000);

        setInterval(() => {
            if (this.isIdle && this.handIcon) {
                this.handIcon.classList.add('super-wave');
                setTimeout(() => {
                    this.handIcon.classList.remove('super-wave');
                }, 2000);
            }
        }, 6000);
    }

    simulateHandDetection() {
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                this.triggerHandDetected();
            }
        });
    }

    triggerHandDetected() {
        this.isIdle = false;
        document.body.classList.add('hand-detected');
        
        const message = document.createElement('div');
        message.className = 'hand-detected-message';
        message.innerHTML = `
            <div class="success-content">
                <div class="success-icon">🎉</div>
                <h2>Geweldig!</h2>
                <p>Je hand is gedetecteerd!</p>
                <p class="english">Great! Your hand is detected!</p>
            </div>
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            document.body.classList.remove('hand-detected');
            message.remove();
            this.isIdle = true;
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new KioskAnimations();
});

// Additional utility functions
function addScreenSaver() {
    let inactivityTimer;
    
    function resetTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            document.body.classList.add('screensaver-mode');
        }, 30000); // 30 seconds of inactivity
    }
    
    // Reset timer on any interaction
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimer, true);
    });
    
    resetTimer();
}

// Start screensaver functionality
addScreenSaver(); 
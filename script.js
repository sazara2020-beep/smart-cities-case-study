// --- JAVASCRIPT LOGIC (External File) ---

// ==============================================
// PARTICLE SYSTEM (Background)
// ==============================================
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
const particleCount = 100;

function resize() {
    // Set canvas size to match the window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles(); // Reinitialize particles on resize
}
window.addEventListener('resize', resize);

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2;
        this.color = Math.random() < 0.5 ? 'var(--neon-blue)' : 'var(--neon-pink)';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Keep particles within the screen boundaries (wrap around)
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 80) { // Connect if they are close
                ctx.strokeStyle = `rgba(0, 243, 255, ${1 - (distance / 80)})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    // Clear the canvas with a translucent color to create particle trails
    ctx.fillStyle = 'rgba(5, 5, 16, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height); 

    connectParticles();
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    // Request the next frame for smooth animation
    requestAnimationFrame(animate);
}

// ==============================================
// SCROLL INDICATOR (The "Scroller")
// ==============================================
const scrollBar = document.getElementById('scroll-progress');

function scrollProgress() {
    // Calculate total scrollable height
    const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    // Get current scroll position
    const scrollPoint = window.scrollY;
    // Calculate percentage and update the bar width
    const percentage = (scrollPoint / totalHeight) * 100;
    scrollBar.style.width = `${percentage}%`;
}

window.addEventListener('scroll', scrollProgress);


// ==============================================
// QUIZ LOGIC
// ==============================================
let currentQuestion = 1;
let score = 0;
const totalQuestions = 5;

// Updates the visual progress bar within the quiz section
function updateQuizProgressBar() {
    const quizBar = document.getElementById('quiz-progress-bar');
    // Percentage based on completed questions (currentQuestion - 1)
    const percentage = (currentQuestion - 1) / totalQuestions * 100;
    quizBar.style.width = `${percentage}%`;
}

// Shows the specified question block and hides others
function showQuestion(qNum) {
    // 1. Hide ALL question blocks
    document.querySelectorAll('.question-block').forEach(block => {
        block.classList.add('hidden');
    });
    
    const nextQ = document.getElementById(`q${qNum}`);
    
    // 2. If the question exists, show it and update the progress bar.
    if (nextQ) {
        nextQ.classList.remove('hidden');
        updateQuizProgressBar();
    } 
    // 3. If qNum is higher than total questions, show results.
    else if (qNum > totalQuestions) {
        showResults();
    }
}

// Handles user clicking an answer button
function checkAnswer(button, isCorrect, qNum) {
    // Disable all buttons on the current question to prevent re-clicking
    document.querySelectorAll(`#q${qNum} .option-btn`).forEach(btn => {
        btn.disabled = true;
    });

    if (isCorrect) {
        button.classList.add('correct');
        score++;
    } else {
        button.classList.add('wrong');
        // Find and highlight the correct answer if the user got it wrong
        const correctButton = Array.from(document.querySelectorAll(`#q${qNum} .option-btn`)).find(btn => btn.getAttribute('onclick').includes('true'));
        if (correctButton) {
            correctButton.classList.add('correct');
        }
    }

    // Wait a moment for the user to see the feedback, then move to the next question
    setTimeout(() => {
        currentQuestion++;
        showQuestion(currentQuestion);
    }, 1000);
}

// Displays the final score screen
function showResults() {
    // Ensure the quiz progress bar looks complete
    document.getElementById('quiz-progress-bar').style.width = '100%'; 

    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');
    document.getElementById('final-score').textContent = score;
}

// Initialization function called when the window finishes loading
window.onload = function () {
    resize(); // Initial canvas setup
    animate(); // Start particle animation
    scrollProgress(); // Initial check for the reading scroller
    updateQuizProgressBar(); // Initial quiz bar setup (0%)
    showQuestion(1); // Start the quiz
};
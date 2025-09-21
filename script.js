document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('constellation-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let nodes = [];
        const nodeCount = 100;
        const maxDist = 120;

        const mouse = {
            x: null,
            y: null
        };

        const heroContent = document.querySelector('.hero-content');
        let contentBox;

        function setCanvasSize() {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            ctx.scale(dpr, dpr);
            if (heroContent) {
                const rect = heroContent.getBoundingClientRect();
                const canvasRect = canvas.getBoundingClientRect();
                contentBox = {
                    left: rect.left - canvasRect.left,
                    top: rect.top - canvasRect.top,
                    right: rect.right - canvasRect.left,
                    bottom: rect.bottom - canvasRect.top
                };
            }
        }

        class Node {
            constructor(x, y, vx, vy) {
                this.x = x;
                this.y = y;
                this.vx = vx;
                this.vy = vy;
                this.radius = Math.random() * 1.5 + 1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 183, 77, 0.8)'; // Kingfisher Orange
                ctx.fill();
            }

            update() {
                if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
                if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

                // Check for collision with the content box
                if (contentBox) {
                    const nextX = this.x + this.vx;
                    const nextY = this.y + this.vy;
                    if (nextX > contentBox.left && nextX < contentBox.right && nextY > contentBox.top && nextY < contentBox.bottom) {
                        this.vx = -this.vx;
                        this.vy = -this.vy;
                    }
                }

                this.x += this.vx;
                this.y += this.vy;
            }
        }

        function init() {
            setCanvasSize();
            nodes = [];
            for (let i = 0; i < nodeCount; i++) {
                let x, y;
                do {
                    x = Math.random() * canvas.width;
                    y = Math.random() * canvas.height;
                } while (contentBox && x > contentBox.left && x < contentBox.right && y > contentBox.top && y < contentBox.bottom);

                const vx = (Math.random() - 0.5) * 0.5;
                const vy = (Math.random() - 0.5) * 0.5;
                nodes.push(new Node(x, y, vx, vy));
            }
        }

        function connect() {
            for (let i = 0; i < nodes.length; i++) {
                // Connect to mouse
                let distToMouse = Math.sqrt(Math.pow(nodes[i].x - mouse.x, 2) + Math.pow(nodes[i].y - mouse.y, 2));
                if (distToMouse < maxDist) {
                    ctx.strokeStyle = `rgba(255, 183, 77, ${1 - distToMouse / maxDist})`; // Kingfisher Orange
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }

                // Connect to other nodes
                for (let j = i + 1; j < nodes.length; j++) {
                    let dist = Math.sqrt(Math.pow(nodes[i].x - nodes[j].x, 2) + Math.pow(nodes[i].y - nodes[j].y, 2));
                    if (dist < maxDist) {
                        ctx.strokeStyle = `rgba(255, 183, 77, ${0.6 - dist / maxDist})`; // Kingfisher Orange
                        ctx.lineWidth = 0.3;
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            nodes.forEach(node => {
                node.update();
                node.draw();
            });
            connect();
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', init);
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        canvas.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        init();
        animate();
    }

    // Contact Form Logic
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(contactForm);
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            }).then(() => {
                contactForm.reset();
                alert('Thank you for your message! It has been sent.');
            }).catch((error) => {
                alert('Sorry, there was an error sending your message. Please try again later.');
            });
        });
    }

    // Mobile Navigation Logic
    const hamburgerButton = document.getElementById('hamburger-button');
    const navLinks = document.getElementById('nav-links');

    if (hamburgerButton && navLinks) {
        hamburgerButton.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isExpanded = navLinks.classList.contains('active');
            hamburgerButton.setAttribute('aria-expanded', isExpanded);
        });

        // Close menu when a link is clicked
        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                navLinks.classList.remove('active');
                hamburgerButton.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Custom Scroll Animation Logic
    const sections = document.querySelectorAll('.fade-in-section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1
    });

    sections.forEach(section => {
        observer.observe(section);
    });
});

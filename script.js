document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('constellation-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let grid = [];
        let traffic = [];
        const gap = 30;
        let cols, rows;
        let centerX, centerY;

        const mouse = {
            x: undefined,
            y: undefined,
            radius: 100 // Area of influence
        };

        class Traffic {
            constructor(startNode, endNode) {
                this.start = startNode;
                this.end = endNode;
                this.progress = 0;
                this.speed = Math.random() * 0.015 + 0.005;
                this.color = 'rgba(255, 183, 77, 0.8)';
            }

            update() {
                this.progress += this.speed;
                if (this.progress >= 1) {
                    const currentEnd = this.end;

                    // Immediately remove if it hits the vertical edge
                    if (currentEnd.isVerticalEdge) {
                        this.progress = 1.1; // Mark for removal
                        return;
                    }

                    const distFromCenter = Math.sqrt(Math.pow(currentEnd.x - centerX, 2) + Math.pow(currentEnd.y - centerY, 2));

                    const outwardNeighbors = currentEnd.neighbors.filter(n => {
                        const neighborDist = Math.sqrt(Math.pow(n.x - centerX, 2) + Math.pow(n.y - centerY, 2));
                        // Add a bias for vertical movement when near the top or bottom
                        const verticalDelta = Math.abs(n.y - centerY) - Math.abs(currentEnd.y - centerY);
                        return neighborDist > distFromCenter || verticalDelta > 0;
                    });

                    if (outwardNeighbors.length > 0) {
                        this.progress = 0;
                        this.start = currentEnd;
                        this.end = outwardNeighbors[Math.floor(Math.random() * outwardNeighbors.length)];
                    } else {
                        this.progress = 1.1; // Mark for removal if no outward path
                    }
                }
            }

            draw() {
                const x = this.start.x + (this.end.x - this.start.x) * this.progress;
                const y = this.start.y + (this.end.y - this.start.y) * this.progress;
                ctx.beginPath();
                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        function init() {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            ctx.scale(dpr, dpr);

            centerX = canvas.offsetWidth / 2;
            centerY = canvas.offsetHeight / 2;

            cols = Math.floor(canvas.offsetWidth / gap);
            rows = Math.floor(canvas.offsetHeight / gap);
            grid = [];
            traffic = [];

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = i * gap + gap / 2;
                    const y = j * gap + gap / 2;
                    const isVerticalEdge = (j === 0 || j === rows - 1);
                    grid.push({ x, y, neighbors: [], isVerticalEdge });
                }
            }

            // Find neighbors
            for (let i = 0; i < grid.length; i++) {
                for (let j = i + 1; j < grid.length; j++) {
                    const dist = Math.sqrt(Math.pow(grid[i].x - grid[j].x, 2) + Math.pow(grid[i].y - grid[j].y, 2));
                    if (dist < gap * 1.5) {
                        grid[i].neighbors.push(grid[j]);
                        grid[j].neighbors.push(grid[i]);
                    }
                }
            }
        }

        function animate() {
            // Create a trailing effect by drawing a semi-transparent background
            ctx.fillStyle = 'rgba(17, 24, 39, 0.25)'; // Use the actual background color #111827
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw nodes
            ctx.fillStyle = 'rgba(255, 183, 77, 0.2)';
            grid.forEach(node => {
                ctx.beginPath();
                ctx.arc(node.x, node.y, 1, 0, Math.PI * 2);
                ctx.fill();
            });

            // Add new particles from the center
            if (Math.random() > 0.1 && traffic.length < 400) {
                const centralNodes = grid.filter(n => Math.sqrt(Math.pow(n.x - centerX, 2) + Math.pow(n.y - centerY, 2)) < 50);
                if (centralNodes.length > 0) {
                    const startNode = centralNodes[Math.floor(Math.random() * centralNodes.length)];
                    if (startNode.neighbors.length > 0) {
                        const endNode = startNode.neighbors[Math.floor(Math.random() * startNode.neighbors.length)];
                        traffic.push(new Traffic(startNode, endNode));
                    }
                }
            }
            
            // Mouse interaction
            if (mouse.x !== undefined && traffic.length < 400) {
                const nearbyNodes = grid.filter(n => Math.sqrt(Math.pow(n.x - mouse.x, 2) + Math.pow(n.y - mouse.y, 2)) < mouse.radius);
                if(nearbyNodes.length > 0) {
                    const startNode = nearbyNodes[Math.floor(Math.random() * nearbyNodes.length)];
                     if (startNode.neighbors.length > 0) {
                        const endNode = startNode.neighbors[Math.floor(Math.random() * startNode.neighbors.length)];
                        traffic.push(new Traffic(startNode, endNode));
                    }
                }
            }

            // Update, draw, and remove old particles
            traffic = traffic.filter(t => t.progress <= 1);
            traffic.forEach(t => {
                t.update();
                t.draw();
            });

            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', init);
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        canvas.addEventListener('mouseleave', () => {
            mouse.x = undefined;
            mouse.y = undefined;
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

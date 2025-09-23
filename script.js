document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('constellation-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let grid = [];
        let hubs = [];
        let traffic = [];
                const gap = 25;
        let cols, rows;

        const mouse = {
            x: undefined,
            y: undefined,
            radius: 100 // Area of influence
        };

        
        class Traffic {
            constructor(generator) {
                this.generator = generator;
                this.startHub = generator;
                this.nodesToVisit = new Set(hubs.filter(h => h.type === 'default'));
                const potentialDestinations = Array.from(this.nodesToVisit);
                this.endHub = potentialDestinations[Math.floor(Math.random() * potentialDestinations.length)];
                this.path = this.findPath(this.startHub, this.endHub);
                this.pathIndex = 0;
                this.progress = 0;
                this.speed = Math.random() * 0.08 + 0.02;
                this.color = 'rgba(255, 183, 77, 0.8)';
            }

            findPath(start, end) {
                let openSet = [start];
                let cameFrom = new Map();
                let gScore = new Map(grid.map(n => [n, Infinity]));
                gScore.set(start, 0);
                let fScore = new Map(grid.map(n => [n, Infinity]));
                fScore.set(start, this.heuristic(start, end));

                while (openSet.length > 0) {
                    let current = openSet.sort((a, b) => fScore.get(a) - fScore.get(b))[0];
                    if (current === end) {
                        let path = [current];
                        while (cameFrom.has(current)) {
                            current = cameFrom.get(current);
                            path.unshift(current);
                        }
                        return path;
                    }
                    openSet = openSet.filter(n => n !== current);
                    for (let neighbor of current.neighbors) {
                        let tentativeGScore = gScore.get(current) + 1;
                        if (tentativeGScore < gScore.get(neighbor)) {
                            cameFrom.set(neighbor, current);
                            gScore.set(neighbor, tentativeGScore);
                            fScore.set(neighbor, tentativeGScore + this.heuristic(neighbor, end));
                            if (!openSet.includes(neighbor)) {
                                openSet.push(neighbor);
                            }
                        }
                    }
                }
                return [];
            }

            heuristic(a, b) {
                return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
            }

            update() {
                if (!this.path || this.path.length === 0) {
                    this.progress = 1.1;
                    return;
                }
                this.progress += this.speed;
                if (this.progress >= 1) {
                    this.progress = 0;
                    this.pathIndex++;
                    if (this.pathIndex >= this.path.length - 1) {
                        this.startHub = this.endHub;
                        if (this.startHub.type === 'terminator') {
                            this.progress = 1.1;
                            return;
                        }
                        this.nodesToVisit.delete(this.startHub);
                        const remainingDefaults = Array.from(this.nodesToVisit);
                        if (remainingDefaults.length > 0) {
                            this.endHub = remainingDefaults[Math.floor(Math.random() * remainingDefaults.length)];
                        } else {
                            const terminators = hubs.filter(h => h.type === 'terminator');
                            if (terminators.length > 0) {
                                this.endHub = terminators[Math.floor(Math.random() * terminators.length)];
                            } else {
                                this.progress = 1.1;
                                return;
                            }
                        }
                        this.path = this.findPath(this.startHub, this.endHub);
                        this.pathIndex = 0;
                        this.progress = 0;
                    }
                }
            }

            draw() {
                if (this.pathIndex >= this.path.length - 1) return;
                const startNode = this.path[this.pathIndex];
                const endNode = this.path[this.pathIndex + 1];
                const x = startNode.x + (endNode.x - startNode.x) * this.progress;
                const y = startNode.y + (endNode.y - startNode.y) * this.progress;
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
            cols = Math.floor(canvas.offsetWidth / gap);
            rows = Math.floor(canvas.offsetHeight / gap);
            grid = [];
            hubs = [];
            traffic = [];
            
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = i * gap + gap / 2;
                    const y = j * gap + gap / 2;
                    grid.push({ x, y, neighbors: [] });
                }
            }

            for (let i = 0; i < grid.length; i++) {
                for (let j = i + 1; j < grid.length; j++) {
                    const dist = Math.sqrt(Math.pow(grid[i].x - grid[j].x, 2) + Math.pow(grid[i].y - grid[j].y, 2));
                    if (dist < gap * 1.5) {
                        grid[i].neighbors.push(grid[j]);
                        grid[j].neighbors.push(grid[i]);
                    }
                }
            }

            // Designate hubs using a farthest point sampling approach
            const numHubs = 15;
            if (grid.length > 0) {
                let firstHub = grid[Math.floor(Math.random() * grid.length)];
                hubs.push(firstHub);
                let candidates = grid.filter(n => n !== firstHub);

                for (let i = 1; i < numHubs && candidates.length > 0; i++) {
                    let bestCandidate = null;
                    let maxMinDist = -1;
                    for (let candidate of candidates) {
                        let minDistToHub = Infinity;
                        for (let hub of hubs) {
                            const dist = Math.sqrt(Math.pow(candidate.x - hub.x, 2) + Math.pow(candidate.y - hub.y, 2));
                            minDistToHub = Math.min(minDistToHub, dist);
                        }
                        if (minDistToHub > maxMinDist) {
                            maxMinDist = minDistToHub;
                            bestCandidate = candidate;
                        }
                    }
                    if (bestCandidate) {
                        hubs.push(bestCandidate);
                        candidates = candidates.filter(n => n !== bestCandidate);
                    }
                }
            }

            const shuffledHubs = [...hubs].sort(() => 0.5 - Math.random());
            const numGenerators = 5;
            const numTerminators = 5;
            shuffledHubs.slice(0, numGenerators).forEach(h => h.type = 'generator');
            shuffledHubs.slice(numGenerators, numGenerators + numTerminators).forEach(h => h.type = 'terminator');
            hubs.forEach(h => { if (!h.type) h.type = 'default'; h.isHub = true; });

            
            const generators = hubs.filter(h => h.type === 'generator');
            const particlesPerGenerator = 10;
            generators.forEach(gen => {
                for (let i = 0; i < particlesPerGenerator; i++) {
                    traffic.push(new Traffic(gen));
                }
            });
        }

        function animate() {
            ctx.fillStyle = 'rgba(17, 24, 39, 0.25)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw grid nodes
            ctx.fillStyle = 'rgba(255, 183, 77, 0.1)';
            grid.forEach(node => {
                ctx.beginPath();
                ctx.arc(node.x, node.y, 1, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw hub nodes
            hubs.forEach(hub => {
                switch (hub.type) {
                    case 'generator':
                        ctx.fillStyle = 'rgba(110, 231, 183, 0.7)'; // Green
                        break;
                    case 'terminator':
                        ctx.fillStyle = 'rgba(252, 165, 165, 0.7)'; // Red
                        break;
                    default:
                        ctx.fillStyle = 'rgba(255, 183, 77, 0.6)'; // Orange
                }
                ctx.beginPath();
                ctx.arc(hub.x, hub.y, 4, 0, Math.PI * 2);
                ctx.fill();
            });

            traffic = traffic.filter(t => t.progress <= 1);
            traffic.forEach(t => {
                t.update();
                t.draw();
            });

            if (Math.random() > 0.95 && traffic.length < 150) {
                const generators = hubs.filter(h => h.type === 'generator');
                if (generators.length > 0) {
                    const gen = generators[Math.floor(Math.random() * generators.length)];
                    traffic.push(new Traffic(gen));
                }
            }

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

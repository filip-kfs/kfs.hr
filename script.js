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

        function setCanvasSize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
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
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fill();
            }

            update() {
                if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
                if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
                this.x += this.vx;
                this.y += this.vy;
            }
        }

        function init() {
            setCanvasSize();
            nodes = [];
            for (let i = 0; i < nodeCount; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
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
                    ctx.strokeStyle = `rgba(184, 155, 114, ${1 - distToMouse / maxDist})`;
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
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 - dist / maxDist})`;
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
            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (response.ok) {
                    alert('Thank you for your message! We will get back to you soon.');
                    contactForm.reset();
                } else {
                    response.json().then(data => {
                        alert(data.errors?.map(e => e.message).join(', ') || 'Oops! There was a problem.');
                    });
                }
            }).catch(() => alert('Oops! There was a problem submitting your form.'));
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {

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

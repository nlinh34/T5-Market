document.addEventListener('DOMContentLoaded', function() {
  // Xử lý form liên hệ
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      
      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          alert('Cảm ơn bạn! Tin nhắn đã được gửi thành công.');
          form.reset();
        } else {
          throw new Error('Gửi tin nhắn thất bại');
        }
      })
      .catch(error => {
        alert('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.');
        console.error('Error:', error);
      });
    });
  }

  // FAQ Accordion Functionality
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const answer = question.nextElementSibling;
      const isActive = question.classList.contains('active');
      
      // Close all other FAQs
      document.querySelectorAll('.faq-question').forEach(q => {
        if (q !== question) {
          q.classList.remove('active');
          q.nextElementSibling.classList.remove('active');
        }
      });
      
      // Toggle current FAQ
      question.classList.toggle('active');
      answer.classList.toggle('active');
    });
  });
});
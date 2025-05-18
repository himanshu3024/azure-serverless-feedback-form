document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('feedbackForm');
  const steps = document.querySelectorAll('.step');
  const formSteps = document.querySelectorAll('.form-step');
  const nextButtons = document.querySelectorAll('.next-step');
  const prevButtons = document.querySelectorAll('.prev-step');
  const ratingStars = document.querySelectorAll('.rating-star');
  const categoryOptions = document.querySelectorAll('.category-option');
  const fileInput = document.getElementById('fileUpload');
  const filePreview = document.getElementById('filePreview');
  const fileRemove = document.getElementById('fileRemove');
  const submitLoader = document.getElementById('submitLoader');
  const feedbackSuccess = document.getElementById('feedbackSuccess');
  const newFeedbackBtn = document.getElementById('newFeedbackBtn');

  let currentStep = 1;
  let selectedCategories = [];

  // Initialize form
  updateStep(currentStep);

  // Step Navigation
  nextButtons.forEach(button => {
    button.addEventListener('click', () => {
      const nextStep = parseInt(button.dataset.next);
      if (validateStep(currentStep)) {
        currentStep = nextStep;
        updateStep(currentStep);
        if (currentStep === 4) {
          updateReview();
        }
      }
    });
  });

  prevButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentStep = parseInt(button.dataset.prev);
      updateStep(currentStep);
    });
  });

  // Rating Stars
  ratingStars.forEach(star => {
    star.addEventListener('click', () => {
      const ratingContainer = star.parentElement;
      const ratingType = ratingContainer.dataset.rating;
      const value = parseInt(star.dataset.value);

      ratingContainer.querySelectorAll('.rating-star').forEach(s => {
        s.classList.remove('active');
        if (parseInt(s.dataset.value) <= value) {
          s.classList.add('active');
        }
      });

      document.getElementById(`${ratingType}Rating`).value = value;
    });
  });

  // Category Selection
  categoryOptions.forEach(option => {
    option.addEventListener('click', () => {
      const value = option.dataset.value;
      if (selectedCategories.includes(value)) {
        selectedCategories = selectedCategories.filter(cat => cat !== value);
        option.classList.remove('active');
      } else {
        selectedCategories.push(value);
        option.classList.add('active');
      }
      document.getElementById('categories').value = selectedCategories.join(', ');
    });
  });

  // File Upload
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        fileInput.value = '';
        return;
      }
      filePreview.style.display = 'flex';
      document.getElementById('fileName').textContent = file.name;
      document.getElementById('fileSize').textContent = `${(file.size / 1024).toFixed(2)} KB`;
    }
  });

  fileRemove.addEventListener('click', () => {
    fileInput.value = '';
    filePreview.style.display = 'none';
  });

  // Form Submission
  form.addEventListener('submit', async e => {
    e.preventDefault();
    submitLoader.style.display = 'block';

    const formData = new FormData();
    formData.append('name', form.name.value);
    formData.append('email', form.email.value);
    formData.append('phone', form.phone.value);
    formData.append('overallRating', form.overallRating.value);
    formData.append('easeRating', form.easeRating.value);
    formData.append('supportRating', form.supportRating.value);
    formData.append('categories', form.categories.value);
    formData.append('message', form.message.value);
    formData.append('contactConsent', form.contactConsent.checked);
    formData.append('newsletter', form.newsletter.checked);
    if (fileInput.files[0]) {
      formData.append('file', fileInput.files[0]);
    }

    try {
      const res = await fetch('/api/SubmitFeedback', {
        method: 'POST',
        body: formData
      });

      const result = await res.json();
      submitLoader.style.display = 'none';
      form.style.display = 'none';
      feedbackSuccess.style.display = 'block';
    } catch (error) {
      console.error('Error:', error);
      submitLoader.style.display = 'none';
      alert('Something went wrong!');
    }
  });

  // New Feedback
  newFeedbackBtn.addEventListener('click', () => {
    form.reset();
    selectedCategories = [];
    categoryOptions.forEach(opt => opt.classList.remove('active'));
    ratingStars.forEach(star => star.classList.remove('active'));
    filePreview.style.display = 'none';
    fileInput.value = '';
    currentStep = 1;
    updateStep(currentStep);
    form.style.display = 'block';
    feedbackSuccess.style.display = 'none';
  });

  // Update Step Display
  function updateStep(step) {
    steps.forEach(s => s.classList.remove('active'));
    formSteps.forEach(fs => fs.classList.remove('active'));

    document.querySelector(`.step[data-step="${step}"]`).classList.add('active');
    document.querySelector(`.form-step[data-step="${step}"]`).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Validate Current Step
  function validateStep(step) {
    let isValid = true;
    if (step === 1) {
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name) {
        document.getElementById('nameError').style.display = 'block';
        isValid = false;
      } else {
        document.getElementById('nameError').style.display = 'none';
      }

      if (!email || !emailRegex.test(email)) {
        document.getElementById('emailError').style.display = 'block';
        isValid = false;
      } else {
        document.getElementById('emailError').style.display = 'none';
      }
    } else if (step === 3) {
      const message = form.message.value.trim();
      if (!message) {
        document.getElementById('messageError').style.display = 'block';
        isValid = false;
      } else {
        document.getElementById('messageError').style.display = 'none';
      }
    }
    return isValid;
  }

  // Update Review Section
  function updateReview() {
    document.getElementById('reviewName').textContent = form.name.value || 'Not provided';
    document.getElementById('reviewEmail').textContent = form.email.value || 'Not provided';
    document.getElementById('reviewOverallRating').textContent = form.overallRating.value || 'Not rated';
    document.getElementById('reviewCategories').textContent = form.categories.value || 'None selected';
    document.getElementById('reviewMessage').textContent = form.message.value || 'Not provided';
  }
});
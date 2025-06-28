document.addEventListener("DOMContentLoaded", () => {
  const feedbackForm = document.getElementById("feedbackForm");
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", handleFeedbackSubmit);
    displayFeedbacks();
  }
});

function handleFeedbackSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("feedbackName").value.trim();
  const comment = document.getElementById("feedbackComment").value.trim();
  if (!name || !comment) return;
  const feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");
  feedbacks.push({ name, comment, date: new Date().toLocaleString() });
  localStorage.setItem("feedbacks", JSON.stringify(feedbacks));
  e.target.reset();
  displayFeedbacks();
}

function displayFeedbacks() {
  const feedbackList = document.getElementById("feedbackList");
  if (!feedbackList) return;
  const feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");
  if (feedbacks.length === 0) {
    feedbackList.innerHTML = '<p style="color:#888;">No feedback yet.</p>';
    return;
  }
  feedbackList.innerHTML = feedbacks
    .map(
      (fb) => `
        <div class="feedback-item">
          <div class="feedback-header">
            <span class="feedback-name">${fb.name}</span>
            <span class="feedback-date">${fb.date}</span>
          </div>
          <div class="feedback-comment">${fb.comment}</div>
        </div>
      `
    )
    .join("");
}

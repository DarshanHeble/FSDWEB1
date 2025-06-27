document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    window.location.href = "signin.html";
    return;
  }

  // Load the current file
  loadCurrentFile();

  // Event Listeners
  document.querySelectorAll(".tool-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const command = btn.dataset.command;
      document.execCommand(command, false, null);
      btn.classList.toggle("active");
    });
  });

  document.querySelector(".font-size").addEventListener("change", (e) => {
    document.execCommand("fontSize", false, e.target.value);
  });

  document.getElementById("saveBtn").addEventListener("click", saveFile);
  document
    .getElementById("downloadBtn")
    .addEventListener("click", downloadFile);
  document.getElementById("historyBtn").addEventListener("click", showHistory);
  document
    .getElementById("signoutBtn")
    .addEventListener("click", handleSignout);

  // Auto-save every 30 seconds
  setInterval(saveFile, 30000);
});

function loadCurrentFile() {
  const fileId = localStorage.getItem("currentFileId");
  if (!fileId) {
    window.location.href = "dashboard.html";
    return;
  }

  const files = JSON.parse(localStorage.getItem("files") || "[]");
  const currentFile = files.find((file) => file.id === fileId);

  if (!currentFile) {
    window.location.href = "dashboard.html";
    return;
  }

  // Update title
  document.getElementById("fileName").textContent = currentFile.name;

  // Load content
  document.getElementById("editor").innerHTML = currentFile.content || "";

  // Initialize history if not exists
  if (!currentFile.history) {
    currentFile.history = [
      {
        timestamp: new Date().toISOString(),
        content: currentFile.content,
        user: JSON.parse(localStorage.getItem("currentUser")).fullName,
      },
    ];

    // Update files in localStorage
    localStorage.setItem("files", JSON.stringify(files));
  }
}

function saveFile() {
  const fileId = localStorage.getItem("currentFileId");
  const content = document.getElementById("editor").innerHTML;
  const files = JSON.parse(localStorage.getItem("files") || "[]");
  const fileIndex = files.findIndex((file) => file.id === fileId);

  if (fileIndex === -1) return;

  // Add to history
  if (!files[fileIndex].history) {
    files[fileIndex].history = [];
  }

  files[fileIndex].history.push({
    timestamp: new Date().toISOString(),
    content: content,
    user: JSON.parse(localStorage.getItem("currentUser")).fullName,
  });

  // Update content
  files[fileIndex].content = content;

  // Save to localStorage
  localStorage.setItem("files", JSON.stringify(files));

  // Update last saved timestamp
  updateLastSaved();
}

function updateLastSaved() {
  const lastSaved = document.getElementById("lastSaved");
  lastSaved.textContent = "Last saved: Just now";
}

function downloadFile() {
  const fileId = localStorage.getItem("currentFileId");
  const files = JSON.parse(localStorage.getItem("files") || "[]");
  const currentFile = files.find((file) => file.id === fileId);

  if (!currentFile) return;

  // Create a blob with the content
  const blob = new Blob([document.getElementById("editor").innerText], {
    type: "text/plain",
  });
  const url = window.URL.createObjectURL(blob);

  // Create a temporary link and click it
  const a = document.createElement("a");
  a.href = url;
  a.download = `${currentFile.name}.txt`;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function showHistory() {
  const fileId = localStorage.getItem("currentFileId");
  const files = JSON.parse(localStorage.getItem("files") || "[]");
  const currentFile = files.find((file) => file.id === fileId);

  if (!currentFile || !currentFile.history) return;

  const historyList = document.querySelector(".history-list");
  historyList.innerHTML = currentFile.history
    .reverse()
    .map(
      (version) => `
        <div class="history-item">
            <div class="history-info">
                <h4>Version by ${version.user}</h4>
                <p>${new Date(version.timestamp).toLocaleString()}</p>
            </div>
            <button class="btn btn-outline" onclick='restoreVersion(${JSON.stringify(
              version
            )})'>
                Restore
            </button>
        </div>
    `
    )
    .join("");

  document.getElementById("historyModal").classList.add("active");
}

function closeHistoryModal() {
  document.getElementById("historyModal").classList.remove("active");
}

function restoreVersion(version) {
  if (
    !confirm(
      "Are you sure you want to restore this version? Current changes will be lost."
    )
  ) {
    return;
  }

  document.getElementById("editor").innerHTML = version.content;
  saveFile();
  closeHistoryModal();
}

function handleSignout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  const modal = document.getElementById("historyModal");
  if (e.target === modal) {
    closeHistoryModal();
  }
});

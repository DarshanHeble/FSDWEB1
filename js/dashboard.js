document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    window.location.href = "signin.html";
    return;
  }

  // Initialize files if not exists
  if (!localStorage.getItem("files")) {
    const demoFiles = [
      {
        id: "1",
        name: "Project Proposal",
        type: "document",
        createdAt: new Date().toISOString(),
        content: "This is a sample project proposal document.",
        owner: currentUser.email,
      },
      {
        id: "2",
        name: "Sales Data",
        type: "csv",
        createdAt: new Date().toISOString(),
        content:
          "Product,Price,Quantity\nLaptop,999,50\nMouse,29.99,100\nKeyboard,59.99,75",
        owner: currentUser.email,
      },
    ];
    localStorage.setItem("files", JSON.stringify(demoFiles));
  }

  // Load files
  loadFiles();

  // Event Listeners
  document
    .getElementById("newFileBtn")
    .addEventListener("click", showNewFileModal);
  document
    .getElementById("newFileForm")
    .addEventListener("submit", handleNewFile);
  document
    .getElementById("signoutBtn")
    .addEventListener("click", handleSignout);
});

function loadFiles() {
  const fileList = document.querySelector(".file-list");
  const files = JSON.parse(localStorage.getItem("files") || "[]");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Filter files for current user
  const userFiles = files.filter((file) => file.owner === currentUser.email);

  fileList.innerHTML = userFiles
    .map((file) => {
      // Preview logic
      let preview = "";
      if (file.type === "document") {
        // Show first 2 lines or 100 chars
        const text = file.content.replace(/<[^>]+>/g, "").replace(/\n/g, " ");
        preview = `<div class='file-preview'>${
          text.length > 100 ? text.slice(0, 100) + "..." : text
        }</div>`;
      } else {
        // CSV: show first 2 rows as table
        const rows = file.content
          .split("\n")
          .slice(0, 2)
          .map((r) => r.split(","));
        preview = `<div class='file-preview'><table class='preview-table'>${rows
          .map(
            (row) =>
              `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
          )
          .join("")}</table></div>`;
      }
      return `
          <div class="file-card file-card-clickable" data-file-id="${file.id}">
            <button class="delete-file-btn" title="Delete" onclick="event.stopPropagation();deleteFile('${
              file.id
            }')">
              <i class="fa fa-trash"></i>
            </button>
            ${preview}
            <div class="file-header">
              <i class="file-icon fa ${
                file.type === "document" ? "fa-file-alt" : "fa-file-csv"
              }"></i>
              <div class="file-info">
                <h3>${file.name}</h3>
              </div>
            </div>
          </div>
        `;
    })
    .join("");

  // Add click event to each file-card (except delete button)
  document.querySelectorAll(".file-card-clickable").forEach((card) => {
    card.addEventListener("click", function () {
      const fileId = this.getAttribute("data-file-id");
      openFile(fileId);
    });
  });
}

function showNewFileModal() {
  const modal = document.getElementById("newFileModal");
  modal.classList.add("active");
}

function closeModal() {
  const modal = document.getElementById("newFileModal");
  modal.classList.remove("active");
}

function handleNewFile(e) {
  e.preventDefault();

  const name = document.getElementById("fileName").value.trim();
  const type = document.getElementById("fileType").value;
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const newFile = {
    id: Date.now().toString(),
    name,
    type,
    createdAt: new Date().toISOString(),
    content:
      type === "csv" ? "Column1,Column2,Column3" : "Enter your content here...",
    owner: currentUser.email,
  };

  const files = JSON.parse(localStorage.getItem("files") || "[]");
  files.push(newFile);
  localStorage.setItem("files", JSON.stringify(files));

  closeModal();
  loadFiles();

  // Reset form
  e.target.reset();

  // Open the new file
  openFile(newFile.id);
}

function openFile(fileId) {
  // Store the current file ID
  localStorage.setItem("currentFileId", fileId);

  // Redirect to the appropriate editor
  const files = JSON.parse(localStorage.getItem("files") || "[]");
  const file = files.find((f) => f.id === fileId);

  if (file.type === "document") {
    window.location.href = "editor.html";
  } else {
    window.location.href = "csv-editor.html";
  }
}

function deleteFile(fileId) {
  if (!confirm("Are you sure you want to delete this file?")) {
    return;
  }

  let files = JSON.parse(localStorage.getItem("files") || "[]");
  files = files.filter((file) => file.id !== fileId);
  localStorage.setItem("files", JSON.stringify(files));
  loadFiles();
}

function handleSignout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  const modal = document.getElementById("newFileModal");
  if (e.target === modal) {
    closeModal();
  }
});

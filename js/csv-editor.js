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
  document.getElementById("addRowBtn").addEventListener("click", addRow);
  document.getElementById("addColumnBtn").addEventListener("click", addColumn);
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

  // Parse CSV content
  const rows = currentFile.content.split("\n").map((row) => row.split(","));

  // Create table
  renderTable(rows);

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

function renderTable(rows) {
  const table = document.getElementById("csvTable");
  table.innerHTML = "";

  rows.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");

    row.forEach((cell, colIndex) => {
      const td = document.createElement(rowIndex === 0 ? "th" : "td");

      // Create input for cell
      const input = document.createElement("input");
      input.value = cell.trim();
      input.type = "text";
      input.dataset.row = rowIndex;
      input.dataset.col = colIndex;
      td.appendChild(input);

      // Add delete column button for header row
      if (rowIndex === 0) {
        const deleteColBtn = document.createElement("button");
        deleteColBtn.className = "delete-column";
        deleteColBtn.innerHTML = '<i class="fa fa-times"></i>';
        deleteColBtn.onclick = () => deleteColumn(colIndex);
        td.appendChild(deleteColBtn);
      }

      // Add delete row button to the first cell of each row (except header)
      if (colIndex === 0 && rowIndex !== 0) {
        const deleteRowBtn = document.createElement("button");
        deleteRowBtn.className = "delete-row";
        deleteRowBtn.innerHTML = '<i class="fa fa-times"></i>';
        deleteRowBtn.onclick = () => deleteRow(rowIndex);
        td.appendChild(deleteRowBtn);
      }

      tr.appendChild(td);
    });

    table.appendChild(tr);
  });
}

function getTableData() {
  const table = document.getElementById("csvTable");
  const rows = [];

  table.querySelectorAll("tr").forEach((tr) => {
    const rowData = [];
    tr.querySelectorAll("input").forEach((input) => {
      rowData.push(input.value);
    });
    if (rowData.length > 0) {
      rows.push(rowData);
    }
  });

  return rows;
}

function addRow() {
  const table = document.getElementById("csvTable");
  const columnCount = table.rows[0]?.cells.length || 1;
  const tr = document.createElement("tr");

  for (let i = 0; i < columnCount; i++) {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.dataset.row = table.rows.length;
    input.dataset.col = i;
    td.appendChild(input);
    // Add delete row button to the first cell
    if (i === 0) {
      const deleteRowBtn = document.createElement("button");
      deleteRowBtn.className = "delete-row";
      deleteRowBtn.innerHTML = '<i class="fa fa-times"></i>';
      deleteRowBtn.onclick = () => deleteRow(table.rows.length);
      td.appendChild(deleteRowBtn);
    }
    tr.appendChild(td);
  }

  table.appendChild(tr);
  saveFile();
}

function addColumn() {
  const table = document.getElementById("csvTable");

  table.querySelectorAll("tr").forEach((tr, rowIndex) => {
    const cell = document.createElement(rowIndex === 0 ? "th" : "td");
    const input = document.createElement("input");
    input.type = "text";
    input.dataset.row = rowIndex;
    input.dataset.col = tr.cells.length - 1;
    cell.appendChild(input);

    if (rowIndex === 0) {
      const deleteColBtn = document.createElement("button");
      deleteColBtn.className = "delete-column";
      deleteColBtn.innerHTML = '<i class="fa fa-times"></i>';
      deleteColBtn.onclick = () => deleteColumn(tr.cells.length - 1);
      cell.appendChild(deleteColBtn);
    }

    tr.appendChild(cell);
  });

  saveFile();
}

function deleteRow(rowIndex) {
  if (!confirm("Are you sure you want to delete this row?")) {
    return;
  }

  const table = document.getElementById("csvTable");
  table.deleteRow(rowIndex);
  saveFile();
}

function deleteColumn(colIndex) {
  if (!confirm("Are you sure you want to delete this column?")) {
    return;
  }

  const table = document.getElementById("csvTable");
  table.querySelectorAll("tr").forEach((tr) => {
    tr.deleteCell(colIndex + 1); // +1 because of delete row button cell
  });
  saveFile();
}

function saveFile() {
  const fileId = localStorage.getItem("currentFileId");
  const tableData = getTableData();
  const csvContent = tableData.map((row) => row.join(",")).join("\n");

  const files = JSON.parse(localStorage.getItem("files") || "[]");
  const fileIndex = files.findIndex((file) => file.id === fileId);

  if (fileIndex === -1) return;

  // Add to history
  if (!files[fileIndex].history) {
    files[fileIndex].history = [];
  }

  files[fileIndex].history.push({
    timestamp: new Date().toISOString(),
    content: csvContent,
    user: JSON.parse(localStorage.getItem("currentUser")).fullName,
  });

  // Update content
  files[fileIndex].content = csvContent;

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

  const csvContent = getTableData()
    .map((row) => row.join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${currentFile.name}.csv`;
  document.body.appendChild(a);
  a.click();

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

  const rows = version.content.split("\n").map((row) => row.split(","));
  renderTable(rows);
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

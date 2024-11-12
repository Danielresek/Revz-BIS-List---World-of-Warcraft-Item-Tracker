// UI Handling
// =======================================
// Functions to manage modals and UI updates

// Function to open the modal for adding a new item
export function openAddItemModal() {
  window.isEditing = false;
  window.editingItemId = null;

  // Clear input fields
  document.getElementById("itemName").value = "";
  document.getElementById("itemDescription").value = "";
  document.getElementById("itemSlot").value = "";
  document.getElementById("itemBoss").value = "";
  document.getElementById("selectedItemIcon").innerHTML = "";

  // Update modal save button
  const saveButton = document.querySelector(".btn button");
  saveButton.innerText = "Save Item";

  // Set modal title and display it
  document.getElementById("addItemModal").style.display = "block";
  const modalTitle = document.querySelector("#addItemModal h2");
  modalTitle.innerText = "Add New Item";
}

// Function to open the modal for editing an existing item
export function openEditItemModal(item) {
  window.isEditing = true;

  // Fill input fields with existing data
  document.getElementById("itemName").value = item.name || "";
  document.getElementById("itemDescription").value = item.description || "";
  document.getElementById("itemSlot").value = item.slot || "";
  document.getElementById("itemBoss").value = item.boss || "";

  if (item.icon) {
    document.getElementById("selectedItemIcon").innerHTML = `
      <img src="https://wow.zamimg.com/images/wow/icons/large/${item.icon}.jpg" alt="${item.name}" width="32" height="32">
    `;
    document
      .getElementById("selectedItemIcon")
      .setAttribute("data-icon-id", item.icon);
  } else {
    document.getElementById("selectedItemIcon").innerHTML = "";
    document.getElementById("selectedItemIcon").removeAttribute("data-icon-id");
  }

  // Update modal save button to call updateItem function
  const saveButton = document.querySelector(".btn button");
  saveButton.innerText = "Update Item";
  saveButton.onclick = window.updateItem;

  // Set modal title and display it
  document.getElementById("addItemModal").style.display = "block";
  const modalTitle = document.querySelector("#addItemModal h2");
  modalTitle.innerText = "Edit Item";
}

// Function to close the add/edit item modal
export function closeAddItemModal() {
  document.getElementById("addItemModal").style.display = "none";
}

// Function to close the delete confirmation modal
export function closeDeleteConfirmModal() {
  document.getElementById("deleteConfirmModal").style.display = "none";
}

// Helper function to add items to the table
export function addItemToTable(item, tableBody, addOnTop = false) {
  const iconUrl = item.icon
    ? `https://wow.zamimg.com/images/wow/icons/large/${item.icon}.jpg`
    : null;

  const row = document.createElement("tr");
  row.setAttribute("data-item-id", item.id);

  row.innerHTML = `
    <td>
      ${
        iconUrl
          ? `<img src="${iconUrl}" alt="${item.name}" width="32" height="32">`
          : "No icon"
      }
    </td>
    <td>${item.name}</td>
    <td>${item.slot}</td>
    <td>${item.boss}</td>
    <td>${item.description}</td>
    <td>
      ${
        item.status === "received"
          ? ""
          : `<button onclick="window.receivedItem(${item.id})" class="action-button received-button"><i class="fas fa-check-circle" style="color: #2196F3;"></i></button>`
      }
      ${
        item.status === "received"
          ? `<button onclick="window.undoReceivedItem(${item.id})" class="action-button undo-button" title="Undo"><i class="fas fa-redo"></i></button>`
          : `<button onclick="window.editItem(${item.id})" class="action-button edit-button" title="Edit"><i class="fas fa-edit"></i></button>`
      }
      <button onclick="window.deleteItem(${
        item.id
      })" class="action-button delete-button" title="Remove"><i class="fas fa-trash-alt"></i></button>
    </td>
  `;

  if (addOnTop) {
    tableBody.insertBefore(row, tableBody.firstChild);
  } else {
    tableBody.appendChild(row);
  }
}

// Function to update row to reflect "received" status
export function updateRowToReceived(row, tableBody) {
  requestAnimationFrame(() => {
    const nameCell = row.querySelector("td:nth-child(2)");
    if (nameCell) {
      let checkmark = nameCell.querySelector(".checkmark");
      if (!checkmark) {
        checkmark = document.createElement("span");
        checkmark.classList.add("checkmark");
        checkmark.innerHTML = `<i class="fas fa-check" style="color: #00FF00;"></i>`;
        nameCell.appendChild(checkmark);
      }
    }

    row.classList.add("completed");

    const actionsCell = row.querySelector("td:last-child");
    actionsCell.innerHTML = "";

    const undoButton = document.createElement("button");
    undoButton.classList.add("action-button", "undo-button");
    undoButton.innerHTML = `<i class="fas fa-redo"></i>`;
    undoButton.onclick = () =>
      window.undoReceivedItem(parseInt(row.getAttribute("data-item-id")));
    actionsCell.appendChild(undoButton);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("action-button", "delete-button");
    deleteButton.innerHTML = `<i class="fas fa-trash-alt"></i>`;
    deleteButton.onclick = () =>
      window.deleteItem(parseInt(row.getAttribute("data-item-id")));
    actionsCell.appendChild(deleteButton);

    tableBody.appendChild(row);
  });
}

// Function to update row to reflect "pending" status
export function updateRowToPending(row, tableBody) {
  requestAnimationFrame(() => {
    const nameCell = row.querySelector("td:nth-child(2)");
    if (nameCell) {
      const checkmark = nameCell.querySelector(".checkmark");
      if (checkmark) {
        checkmark.remove();
      }
    }

    row.classList.remove("completed");

    const actionsCell = row.querySelector("td:last-child");
    actionsCell.innerHTML = "";

    const receivedButton = document.createElement("button");
    receivedButton.classList.add("action-button", "received-button");
    receivedButton.innerHTML = `<i class="fas fa-check-circle" style="color: #2196F3;"></i>`;
    receivedButton.onclick = () =>
      window.receivedItem(parseInt(row.getAttribute("data-item-id")));
    actionsCell.appendChild(receivedButton);

    const editButton = document.createElement("button");
    editButton.classList.add("action-button", "edit-button");
    editButton.innerHTML = `<i class="fas fa-edit"></i>`;
    editButton.onclick = () =>
      window.editItem(parseInt(row.getAttribute("data-item-id")));
    actionsCell.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("action-button", "delete-button");
    deleteButton.innerHTML = `<i class="fas fa-trash-alt"></i>`;
    deleteButton.onclick = () =>
      window.deleteItem(parseInt(row.getAttribute("data-item-id")));
    actionsCell.appendChild(deleteButton);

    row.style.display = "none";
    row.offsetHeight;
    row.style.display = "";

    tableBody.insertBefore(row, tableBody.firstChild);
  });
}

// Function to undo item received status
export async function undoReceivedItem(id, tableBody) {
  try {
    const response = await fetch(`/items/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "pending" }),
    });

    if (!response.ok) {
      console.error("Error updating item status");
      alert("Failed to undo received status. Please try again.");
      return;
    }

    const row = document.querySelector(`tr[data-item-id="${id}"]`);
    if (row) {
      row.classList.add("glow-effect");

      setTimeout(() => {
        row.classList.remove("glow-effect");
        updateRowToPending(row, tableBody);
      }, 500);
    }
  } catch (error) {
    console.error("Error undoing item status:", error);
    alert("An error occurred while undoing item status. Please try again.");
  }
}

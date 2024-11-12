// home.js
// =======================================
// Import necessary API and UI handler functions
import { fetchItems, saveItem, updateItem, deleteItem } from "./api.js";

import {
  openAddItemModal,
  openEditItemModal,
  closeAddItemModal,
  closeDeleteConfirmModal,
  addItemToTable,
  updateRowToReceived,
  undoReceivedItem, // Sørg for at denne importeres fra uiHandler.js
} from "./uiHandler.js";

// References to important DOM elements used throughout the script
const tableBody = document.getElementById("item-table-body");
const characterDropdown = document.getElementById("characterSelect");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

// Global Variables
let isEditing = false;
let editingItemId = null;
let deleteItemId = null;

// Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
  if (document.getElementById("characterSelect")) {
    await fetchCharacters();
  }
});

if (characterDropdown) {
  characterDropdown.addEventListener("change", async () => {
    const characterId = characterDropdown.value;
    const items = await fetchItems(characterId);
    renderItems(items);
    updateProgressBar(items);
  });
}

// Functions to handle Modals and Items
window.openAddItemModal = () => {
  isEditing = false;
  openAddItemModal();
};

window.openEditItemModal = async (id) => {
  isEditing = true;
  editingItemId = id;

  const items = await fetchItems(editingItemId);
  const item = items.length ? items[0] : null;

  if (item) {
    openEditItemModal(item);
  }
};

window.editItem = async (id) => {
  isEditing = true;
  editingItemId = id;

  try {
    // Fetch the item by ID to populate the modal with existing data
    const response = await fetch(`/items/${id}`);
    if (!response.ok) {
      console.error("Failed to fetch item for editing");
      return;
    }
    const item = await response.json();

    // Call the openEditItemModal function to populate the modal
    if (item) {
      openEditItemModal(item);
    }
  } catch (error) {
    console.error("Error fetching item:", error);
  }
};

window.closeAddItemModal = closeAddItemModal;

window.deleteItem = (id) => {
  deleteItemId = id;
  document.getElementById("deleteConfirmModal").style.display = "block";
};

window.closeDeleteConfirmModal = closeDeleteConfirmModal;

window.confirmDeleteItem = async () => {
  const isSuccess = await deleteItem(deleteItemId);
  if (isSuccess) {
    const characterId = characterDropdown.value;
    const items = await fetchItems(characterId);
    renderItems(items);
    updateProgressBar(items);
  }
  closeDeleteConfirmModal();
};

// Function to render items in the table
function renderItems(items) {
  // Clear table before rendering
  tableBody.innerHTML = "";

  // Sort items to ensure "received" items are at the bottom
  items.sort((a, b) => (a.status === "received" ? 1 : -1));

  // Add each item to the table
  items.forEach((item) => {
    addItemToTable(item, tableBody);

    // Sjekk om item har status som mottatt og legg til visuell indikasjon
    const row = document.querySelector(`tr[data-item-id="${item.id}"]`);
    if (item.status === "received" && row) {
      updateRowToReceived(row, tableBody);
    }
  });

  // Oppdater progress baren etter at alle elementene er rendret
  updateProgressBar(items);
}

// Function to update the progress bar based on collected items
function updateProgressBar(items) {
  // Calculate how many items are received
  const receivedItems = items.filter(
    (item) => item.status === "received"
  ).length;
  const totalItems = items.length; // Total antall elementer er basert på items-arrayet

  // Calculate the percentage of received items
  const progressPercentage =
    totalItems > 0 ? (receivedItems / totalItems) * 100 : 0;

  // Update the width of the progress bar fill
  progressFill.style.width = `${progressPercentage}%`;

  // Update the progress text to reflect received items
  progressText.textContent = `${receivedItems} of ${totalItems} items collected (${Math.round(
    progressPercentage
  )}%)`;
}

// Save Item function
window.saveItem = async () => {
  const item = {
    name: document.getElementById("itemName").value,
    description: document.getElementById("itemDescription").value,
    slot: document.getElementById("itemSlot").value,
    boss: document.getElementById("itemBoss").value,
    character_id: characterDropdown.value,
    icon:
      document
        .getElementById("selectedItemIcon")
        .getAttribute("data-icon-id") || null,
  };

  const savedItem = await saveItem(item);
  if (savedItem) {
    closeAddItemModal();
    const characterId = characterDropdown.value;
    const items = await fetchItems(characterId);
    renderItems(items);
    updateProgressBar(items);
  }
};

// Update Item function
window.updateItem = async () => {
  const item = {
    name: document.getElementById("itemName").value,
    description: document.getElementById("itemDescription").value,
    slot: document.getElementById("itemSlot").value,
    boss: document.getElementById("itemBoss").value,
    character_id: characterDropdown.value,
    icon:
      document
        .getElementById("selectedItemIcon")
        .getAttribute("data-icon-id") || null,
  };

  const isSuccess = await updateItem(editingItemId, item);
  if (isSuccess) {
    closeAddItemModal();
    const characterId = characterDropdown.value;
    const items = await fetchItems(characterId);
    renderItems(items);
    updateProgressBar(items);
  }
};

// Fetch Characters for the dropdown
async function fetchCharacters() {
  try {
    const response = await fetch("/characters");
    if (!response.ok) {
      throw new Error("Not Found");
    }
    const characters = await response.json();

    characterDropdown.innerHTML =
      "<option value=''>-- Choose a character --</option>";
    characters.forEach((character) => {
      const option = document.createElement("option");
      option.value = character.id;
      option.textContent = character.name;
      option.setAttribute("data-icon-url", character.classIconUrl);
      characterDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching characters:", error);
  }
}

// Mark an item as received
window.receivedItem = async (id) => {
  try {
    const response = await fetch(`/items/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "received" }),
    });

    if (!response.ok) {
      console.error("Error updating item status");
      alert("Failed to mark item as received. Please try again.");
      return;
    }

    const row = document.querySelector(`tr[data-item-id="${id}"]`);
    if (row) {
      // Legg til glow-effekten før elementet blir re-rendret
      row.classList.add("glow-effect");

      // Bruk requestAnimationFrame for å gi tid til animasjonen
      requestAnimationFrame(() => {
        setTimeout(() => {
          row.classList.remove("glow-effect");
          const characterId = characterDropdown.value;
          // Hent og oppdater tabellen og progress bar
          fetchItems(characterId).then((items) => {
            renderItems(items);
          });
        }, 500); // La animasjonen vare i 500ms før vi oppdaterer tabellen
      });
    }
  } catch (error) {
    console.error("Error marking item as received:", error);
    alert("An error occurred while updating item status. Please try again.");
  }
};

// Use the imported function from uiHandler.js for undoReceivedItem
window.undoReceivedItem = async (id) => {
  await undoReceivedItem(id, tableBody);
  const characterId = characterDropdown.value;
  const items = await fetchItems(characterId);
  updateProgressBar(items);
};

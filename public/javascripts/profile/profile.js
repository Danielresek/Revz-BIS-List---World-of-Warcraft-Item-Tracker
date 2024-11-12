// profile.js
// =======================================
// Import necessary API and UI handler functions
import { deleteCharacter, addCharacter } from "./characterApi.js";
import {
  openAddCharacterModal,
  closeAddCharacterModal,
  closeAllModals,
  setupDropdown,
} from "./uiHandler.js";

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  console.log("Profile.js is loaded!");

  // Set up event listener for adding a new character
  document
    .getElementById("addCharacterForm")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent page refresh on form submission

      // Gather form values
      const name = document.getElementById("characterName").value;
      const characterClassValueElement = document.getElementById(
        "characterClassValue"
      );
      const classIconUrlElement = document.getElementById("classIconUrl");

      // Validate form fields
      if (!characterClassValueElement || !classIconUrlElement) {
        console.error("Character class or class icon URL is missing, aborting");
        return;
      }

      // Add character using API function
      addCharacter(
        name,
        characterClassValueElement.value,
        classIconUrlElement.value
      );
    });

  // Set up the dropdown menu
  setupDropdown();

  // Modal handling functions
  window.openAddCharacterModal = openAddCharacterModal;
  window.closeAddCharacterModal = closeAddCharacterModal;
  window.closeAllModals = closeAllModals;

  // Character management functions
  window.deleteCharacter = async function (characterId) {
    if (confirm("Are you sure you want to delete this character?")) {
      await deleteCharacter(characterId);
    }
  };
});

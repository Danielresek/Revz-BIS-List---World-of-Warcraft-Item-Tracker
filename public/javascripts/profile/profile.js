// profile.js
// =======================================
// Import necessary API and UI handler functions
import { deleteCharacter, addCharacter } from "./characterApi.js";
import {
  openAddCharacterModal,
  closeAddCharacterModal,
  closeAllModals,
  setupDropdown,
  openEditCharacterModal,
} from "./uiHandler.js";

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  console.log("Profile.js is loaded!");

  // Set up event listener for adding a new character
  document
    .getElementById("addCharacterForm")
    .addEventListener("submit", async function (event) {
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

      // Immediately add the new character to the DOM before making API call
      const characterList = document.querySelector(".character-list");
      const characterItem = document.createElement("div");
      characterItem.className = "character-item pending-character";
      const tempId = `temp-${new Date().getTime()}`;
      characterItem.id = `character-${tempId}`;
      characterItem.innerHTML = `
        <div class="character-info">
          <img src="${classIconUrlElement.value}" alt="Character Icon" class="character-icon">
          <span class="character-name">${name}</span>
        </div>
        <div class="character-buttons">
          <button onclick="openEditCharacterModal('${tempId}', '${name}')">Edit</button>
          <button class="delete-button" onclick="deleteCharacter('${tempId}')">Delete</button>
        </div>
      `;
      characterList.appendChild(characterItem);

      // Add character using API function
      const result = await addCharacter(
        name,
        characterClassValueElement.value,
        classIconUrlElement.value
      );

      if (result.success) {
        // Update temporary ID with actual ID from the backend
        characterItem.id = `character-${result.data.id}`;
        characterItem
          .querySelector(".delete-button")
          .setAttribute("onclick", `deleteCharacter('${result.data.id}')`);
        characterItem
          .querySelector(".character-buttons button")
          .setAttribute(
            "onclick",
            `openEditCharacterModal('${result.data.id}', '${name}')`
          );

        Swal.fire({
          icon: "success",
          title: "Character added successfully!",
          background: "#333333",
          color: "#ffda79",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        });

        // Close the modal
        closeAddCharacterModal();
      } else {
        // Remove character if API call failed
        characterItem.remove();
        Swal.fire({
          icon: "error",
          title: result.message,
          background: "#333333",
          color: "#ffda79",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        });
      }
    });

  // Set up the dropdown menu
  setupDropdown();

  // Modal handling functions
  window.openAddCharacterModal = openAddCharacterModal;
  window.closeAddCharacterModal = closeAddCharacterModal;
  window.closeAllModals = closeAllModals;
  window.openEditCharacterModal = openEditCharacterModal;

  // Character management functions
  window.deleteCharacter = async function (characterId) {
    const confirmed = await Swal.fire({
      title: "Are you sure you want to delete this character?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      background: "#333333",
      color: "#ffda79",
    });

    if (confirmed.isConfirmed) {
      // Remove character from the DOM immediately
      const characterElement = document.getElementById(
        `character-${characterId}`
      );
      if (characterElement) {
        characterElement.remove();
      }

      // Delete character using API function
      const result = await deleteCharacter(characterId);
      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Character deleted successfully!",
          background: "#333333",
          color: "#ffda79",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: result.message,
          background: "#333333",
          color: "#ffda79",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        });
      }
    }
  };

  // Character save changes function for editing character
  window.saveCharacterChanges = async function () {
    const characterNameInput = document.getElementById("editCharacterName");
    const editModal = document.getElementById("editCharacterModal");

    if (characterNameInput && editModal) {
      const updatedName = characterNameInput.value;
      const characterId = editModal.getAttribute("data-character-id");

      if (!characterId) {
        console.error("Character ID not found for saving changes.");
        return;
      }

      try {
        // Make a PUT request to update the character
        const response = await fetch(`/characters/${characterId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: updatedName }),
        });

        if (response.ok) {
          // Update DOM with the new name
          const characterElement = document.getElementById(
            `character-${characterId}`
          );
          if (characterElement) {
            characterElement.querySelector(".character-name").textContent =
              updatedName;
          }

          // Close the modal after successful update
          closeAllModals();

          // Show a success message
          Swal.fire({
            icon: "success",
            title: "Character updated successfully!",
            background: "#333333",
            color: "#ffda79",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
          });
        } else {
          console.error("Failed to update character.");
          Swal.fire({
            icon: "error",
            title: "Failed to update character. Please try again.",
            background: "#333333",
            color: "#ffda79",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
          });
        }
      } catch (error) {
        console.error("Error occurred while updating character:", error);
        Swal.fire({
          icon: "error",
          title: "An error occurred while updating the character.",
          background: "#333333",
          color: "#ffda79",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        });
      }
    } else {
      console.error("Character name input or Edit Character modal not found.");
    }
  };
});

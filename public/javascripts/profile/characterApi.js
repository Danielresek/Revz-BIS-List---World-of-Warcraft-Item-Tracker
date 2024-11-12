// characterApi.js
// =======================================
// Functions for interacting with the backend API for character management

// Function to delete a character based on character ID
export async function deleteCharacter(characterId) {
  const id = parseInt(characterId, 10);

  if (isNaN(id)) {
    console.error("Invalid character ID:", characterId);
    alert("Invalid character ID. Could not delete.");
    return;
  }

  try {
    const response = await fetch(`/characters/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      console.log(`Character with ID ${id} deleted successfully.`);
      location.reload();
    } else {
      const errorText = await response.text();
      console.error("Failed to delete character:", errorText);
      alert("Failed to delete character");
    }
  } catch (error) {
    console.error("Error occurred while deleting character:", error);
    alert("An error occurred while deleting the character");
  }
}

// Function to add a new character
export async function addCharacter(name, characterClass, classIconUrl) {
  try {
    const response = await fetch("/characters/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, characterClass, classIconUrl }),
    });

    const data = await response.json();
    if (data.success) {
      console.log("Character added successfully:", data);
      location.reload();
    } else {
      console.error("Failed to add character");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

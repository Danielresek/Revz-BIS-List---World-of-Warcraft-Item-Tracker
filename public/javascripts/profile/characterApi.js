// characterApi.js
// =======================================
// Functions for interacting with the backend API for character management

// Function to delete a character based on character ID
export async function deleteCharacter(characterId) {
  const id = parseInt(characterId, 10);

  if (isNaN(id)) {
    return { success: false, message: "Invalid character ID" };
  }

  try {
    const response = await fetch(`/characters/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorText = await response.text();
      return { success: false, message: errorText };
    }
  } catch (error) {
    console.error("Error occurred while deleting character:", error);
    return {
      success: false,
      message: "An error occurred while deleting the character",
    };
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
      return { success: true, data: data.character };
    } else {
      return {
        success: false,
        message: "Failed to add character. Please try again.",
      };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      success: false,
      message:
        "An error occurred while adding the character. Please try again.",
    };
  }
}

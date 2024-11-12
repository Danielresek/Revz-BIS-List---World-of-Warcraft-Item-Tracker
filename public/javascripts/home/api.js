// API Handling
// =======================================
// All functions related to interacting with the backend API

export async function fetchItems(characterId) {
  try {
    const response = await fetch(`/items/${characterId}`);
    if (!response.ok) {
      console.error("Error fetching items");
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
}

export async function saveItem(item) {
  try {
    const response = await fetch("/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });
    if (response.ok) {
      return await response.json();
    } else {
      console.error("Error saving item");
      alert("Failed to save item. Please choose a character first.");
      return null;
    }
  } catch (error) {
    console.error("Error saving item:", error);
    alert("An error occurred while saving the item. Please try again.");
    return null;
  }
}

export async function updateItem(id, item) {
  try {
    const response = await fetch(`/items/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });
    if (response.ok) {
      return true;
    } else {
      console.error("Error updating item");
      alert("Failed to update item. Please try again.");
      return false;
    }
  } catch (error) {
    console.error("Error updating item:", error);
    alert("An error occurred while updating the item. Please try again.");
    return false;
  }
}

export async function deleteItem(deleteItemId) {
  try {
    const response = await fetch(`/items/${deleteItemId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      return true;
    } else {
      console.error("Error deleting item");
      alert("Failed to delete item. Please try again.");
      return false;
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while deleting the item. Please try again.");
    return false;
  }
}

// API Handling
// =======================================
// All functions related to interacting with the backend API

import { getCsrf } from "../utils/csrf.js";

export async function fetchItems(characterId) {
  try {
    const response = await fetch(`/items/${characterId}`, { credentials: 'same-origin' });
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

// Add item
export async function saveItem(item) {
  try {
    const csrf = getCsrf();
    const response = await fetch("/items", {
      method: "POST",
      headers: Object.assign({
        "Content-Type": "application/json",
      }, csrf ? { "X-CSRF-Token": csrf } : {}),
      credentials: 'same-origin',
      body: JSON.stringify(item),
    });
    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "Item saved successfully!",
        background: "#333333",
        color: "#ffda79",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return await response.json();
    } else {
      console.error("Error saving item");
      Swal.fire({
        icon: "error",
        title: "Failed to save item. Please choose a character first.",
        background: "#333333",
        color: "#ffda79",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return null;
    }
  } catch (error) {
    console.error("Error saving item:", error);
    Swal.fire({
      icon: "error",
      title: "An error occurred while saving the item. Please try again.",
      background: "#333333",
      color: "#ffda79",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
    return null;
  }
}

// Update item
export async function updateItem(id, item) {
  try {
    const csrf = getCsrf();
    const response = await fetch(`/items/${id}`, {
      method: "PUT",
      headers: Object.assign({
        "Content-Type": "application/json",
      }, csrf ? { "X-CSRF-Token": csrf } : {}),
      credentials: 'same-origin',
      body: JSON.stringify(item),
    });
    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "Item updated successfully!",
        background: "#333333",
        color: "#ffda79",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return true;
    } else {
      console.error("Error updating item");
      Swal.fire({
        icon: "error",
        title: "Failed to update item. Please try again.",
        background: "#333333",
        color: "#ffda79",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return false;
    }
  } catch (error) {
    console.error("Error updating item:", error);
    Swal.fire({
      icon: "error",
      title: "An error occurred while updating the item. Please try again.",
      background: "#333333",
      color: "#ffda79",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
    return false;
  }
}

// Delete item
export async function deleteItem(deleteItemId) {
  try {
    const csrf = getCsrf();
    const response = await fetch(`/items/${deleteItemId}`, {
      method: "DELETE",
      credentials: 'same-origin',
      headers: Object.assign({}, csrf ? { "X-CSRF-Token": csrf } : {}),
    });
    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "Item deleted successfully!",
        background: "#333333",
        color: "#ffda79",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return true;
    } else {
      console.error("Error deleting item");
      Swal.fire({
        icon: "error",
        title: "Failed to delete item. Please try again.",
        background: "#333333",
        color: "#ffda79",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return false;
    }
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "An error occurred while deleting the item. Please try again.",
      background: "#333333",
      color: "#ffda79",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
    return false;
  }
}

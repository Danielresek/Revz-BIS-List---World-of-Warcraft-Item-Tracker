// itemIcons.js
// =======================================
// Script for managing item icon selection and suggestions

// DOMContentLoaded Event Listener
document.addEventListener("DOMContentLoaded", async () => {
  const itemNameInput = document.getElementById("itemName");
  const suggestionsBox = document.getElementById("suggestions");
  const selectedItemIcon = document.getElementById("selectedItemIcon");

  let allItems = []; // Store all items loaded from db.json

  // Load data from db.json once when the page is loaded
  try {
    const response = await fetch("/data/db.json");
    if (!response.ok) {
      throw new Error("Failed to load db.json");
    }
    const data = await response.json();
    allItems = data.items;
  } catch (error) {
    console.error("Error loading items from db.json:", error);
  }

  // Display suggestions while user types in the input field
  itemNameInput.addEventListener("input", () => {
    const query = itemNameInput.value.toLowerCase();

    // Hide suggestions if input is too short
    if (query.length < 1) {
      suggestionsBox.innerHTML = "";
      suggestionsBox.style.display = "none";
      return;
    }

    // Filter items based on input and display a maximum of five suggestions
    const filteredItems = allItems
      .filter((item) => item.name && item.name.toLowerCase().includes(query))
      .slice(0, 5);

    // Display filtered items or hide the suggestions box if none are found
    if (filteredItems.length > 0) {
      suggestionsBox.innerHTML = filteredItems
        .map(
          (item) => `
            <div class="suggestion-item" onclick="selectItem('${item.name}', '${item.icon}')">
              <img src="https://wow.zamimg.com/images/wow/icons/large/${item.icon}.jpg" alt="${item.name}" width="24" height="24">
              ${item.name}
            </div>
          `
        )
        .join("");
      suggestionsBox.style.display = "block";
    } else {
      suggestionsBox.innerHTML = "";
      suggestionsBox.style.display = "none";
    }
  });

  // Select an item from the suggestions
  window.selectItem = function (name, icon) {
    itemNameInput.value = name;
    selectedItemIcon.innerHTML = `<img src="https://wow.zamimg.com/images/wow/icons/large/${icon}.jpg" alt="${name}" width="32" height="32">`;
    selectedItemIcon.setAttribute("data-icon-id", icon);
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.display = "none";
  };

  // Reset input field and selected icon when the modal is closed
  document.querySelector(".close").addEventListener("click", () => {
    resetItemInput();
  });

  // Reset input field and selected icon when "Save Item" button is clicked
  document.querySelector(".btn button").addEventListener("click", () => {
    resetItemInput();
  });

  // Function to reset the input field and selected icon
  function resetItemInput() {
    itemNameInput.value = "";
    selectedItemIcon.innerHTML = "";
    selectedItemIcon.removeAttribute("data-icon-id");
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.display = "none";
  }

  // Disable autocomplete for the input field for better UX
  itemNameInput.setAttribute("autocomplete", "off");
});

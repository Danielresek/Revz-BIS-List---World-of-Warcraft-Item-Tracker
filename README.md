![MyBIS Logo](public/images/logo.png)

# Revz BIS List - World of Warcraft Item Tracker

## About the Project

**Revz BIS List** is a web application created for World of Warcraft players who want to track their **Best in Slot (BIS)** gear for their characters. The app allows users to add characters, manage BIS items, and mark items as collected. This gives players an easy way to visualize their progression towards full BIS gear.

https://www.revzbis.com/

_The project is currently in light development, but will soon be actively updated and expanded for the new Mists of Pandaria Classic expansion._

### Preview Screenshots (Old logo)

**Home Page:**
![Home Page](public/images/home_screenshot.png)

**Profile Page:**
![Profile Page](public/images/profile_screenshot.png)

**Add Item Page:**
![Add Item Page](public/images/addItem_screenshot.png)

**Login Page:**
![Login Page](public/images/login_screenshot.png)

## Features

- 🔐 **User Registration & Login** – Secure authentication system.
- 🎭 **Character Management** – Add, edit, and delete characters with class-specific icons.
- 🎒 **Item Management** – Manage BIS items for each character.
- ✅ **Track Progress** – Mark items as collected; visual progress bar shows BIS completion.

## Technologies Used

- **Backend:** Node.js with Express.js
- **Database:** PostgreSQL (hosted on Render)
- **Frontend:** EJS, HTML, CSS, and JavaScript
- **ORM:** Sequelize
- **Authentication:** Passport with Bcrypt and express-session
- **Hosting:** Render

## Directory Structure

The project is organized to make it easy to expand and maintain:

- **data/**: Contains a list of all BIS items that players can add, which is used for searching specific items when pressing the "Add items" button in the application.

- **middleware/**: Contains middleware functions used in the application for authentication. For example, `auth.js` handles user login and verification using Supertokens to authenticate users.

- **models/**: Contains database models for various entities like users, characters, and items. These models are used to define and interact with the database, such as through Sequelize ORM.

- **public/**: Contains static content that is directly accessible by the client. This includes images, CSS files, and JavaScript files used for frontend styling and functionality.

- **javascripts/**: This folder contains frontend JavaScript files to manage functionality on specific pages. The folder is divided into `home` and `profile`, each subfolder having JavaScript files that handle the logic for that specific part of the application, like DOM manipulation and API calls.

- **routes/**: Contains all API endpoints for managing various functionalities, such as users, characters, and items. These files define how the server responds to HTTP requests for creating, reading, updating, and deleting resources.

- **views/**: Contains EJS files used to dynamically generate HTML pages. This includes templates for all the pages that the user sees, such as the home page, profile page, and different modals used for adding or editing items.

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Danielresek/revz-BIS-List---World-of-Warcraft-Item-Tracker.git
   ```

2. **Install dependencies**

   Navigate to the project folder and run:

   ```bash
   npm install
   ```

3. **Create a PostgreSQL Database**

   Recommended: Use Render, Railway, or any PostgreSQL host.
   Example database name: `revzbis`.

4. **Environment Variables**

   Create a .env file in the root directory and add the following environment variables:

   ```bash
   DATABASE_URL=postgresql://your_user:your_password@your_host:5432/revzbis
   DB_DIALECT=postgres
   SESSION_SECRET=your-session-secret
   ```

   _Use the Internal Database URL if running on Render, or the External Database URL if testing locally._

5. **Start the server**

   ```bash
   npm start
   ```

   The server will run at `http://localhost:3000`.

## Usage

- **Add Characters** by navigating to the "Profile" page after logging in.
- **Add BIS Items** by selecting a character and clicking "Add Item".
- **Mark Items as Collected** by clicking on the checkmark in the actions column.
- **Get an Overview** of your progression using the progress bar, which shows how many BIS items you have collected.

## Roadmap

- **Improve and Secure User Registration and Login:** Implement enhanced security features and better user experience for authentication.
- **Expansion-Specific Features:** Allow users to choose which expansion/version of the game they are playing, so items, bosses, and locations can be adapted accordingly.
- **Share BIS List and Progress:** Let users share their BIS lists and progress with others.
- **Expand Services:** Extend the application to include integrations such as Warcraftlogs, boss guides, and boss loot tables.

## Contact

Have questions, suggestions, or feedback?
Reach out via GitHub or email.

---

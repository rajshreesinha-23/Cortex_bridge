 

 
# 🚀 **AUTHENTICATION SYSTEM - Node.js, Express, MongoDB & JWT** 🔐

Welcome to the **Authentication System** project! 🎉 This project implements user **signup** and **login** functionality using **JWT** authentication, **bcrypt** for password hashing, and a **MongoDB** database for user data storage.

Here, we’ll cover everything you need to know, from the project structure to running the app locally, testing endpoints, and more! 📝💡

---

## 📂 **Project Structure**

 
/AUTH-SYSTEM<br>
├── /api<br>
│ └── server.js 🖥️ (Main server file with Express app)<br>
├── /models<br>
│ └── User.js 🗂️ (User schema with username, email, password)<br>
├── /routes<br>
│ └── auth.js 🔑 (Routes for signup, login, authentication)<br>
├── .env 🔒 (Environment variables for MongoDB and JWT secret)<br>
├── .gitignore 🚫 (Excludes node_modules and sensitive files)<br>
├── package.json 📦 (NPM dependencies and scripts)<br>
└── vercel.json ⚡ (Vercel deployment config for serverless)<br>

 

---

## 📝 **File Descriptions**

### 🖥️ `api/server.js`

* This is the **main entry point** of the app.
* **Sets up** the Express server with MongoDB connection and routes.
* **Uses** `dotenv` for environment variables and `cors` for handling cross-origin requests.

### 🔑 `routes/auth.js`

* Handles **authentication logic** (signup and login).
* **Uses** `bcrypt` to hash passwords and `jsonwebtoken` for generating JWT tokens.
* **Validates** input and checks for duplicate usernames or emails.

### 🗂️ `models/User.js`

* Defines the **user schema** for MongoDB (username, email, and hashed password).
* Ensures **unique usernames** and **emails** using Mongoose validation.

### 🔒 `.env`

* Contains **sensitive environment variables**.
* Store your **MongoDB connection URI** and **JWT secret** here.

### 📦 `package.json`

* Lists all the **NPM dependencies** and **scripts**.
* Run commands like `npm run dev` to start the server with **nodemon**.

### ⚡ `vercel.json`

* Configures the **deployment** on Vercel for serverless functions.

---

## 🛠️ **How to Run Locally** 🖥️

### 1️⃣ **Clone the Repo**

```bash
git clone https://github.com/your-username/auth-system.git
cd auth-system
````

### 2️⃣ **Install Dependencies**

Make sure you have **Node.js** and **npm** installed! If not, download them [here](https://nodejs.org/).

```bash
npm install
```

### 3️⃣ **Create `.env` File**

In your root directory, create a `.env` file with the following values:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 4️⃣ **Run the App Locally** 🌍

To start the server locally, use:

```bash
npm run dev
```

This will run the server with **nodemon** for automatic restarts upon file changes. 🌱

Your app will be running at `http://localhost:5000`. 🎉

---

## 🔌 **Testing the Endpoints** 💥

You can test the **signup** and **login** functionality using **Postman** or **cURL**.

### 📝 **Signup Endpoint**

**Method:** `POST`
**URL:** `http://localhost:5000/api/auth/signup`

**Body (raw JSON):**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "mypassword123"
}
```

### 🔑 **Login Endpoint**

**Method:** `POST`
**URL:** `http://localhost:5000/api/auth/login`

**Body (raw JSON):**

```json
{
  "identifier": "john_doe",  // OR use email "john@example.com"
  "password": "mypassword123"
}
```

---

## 🏁 **How to Deploy** 🚀

### 🌍 **Deploy on Vercel**

1. Sign up on [Vercel](https://vercel.com/).

2. **Link your GitHub repo**.

3. Add the `.env` variables directly in Vercel's **Environment Variables** settings:

   * `MONGO_URI=your_mongodb_connection_string`
   * `JWT_SECRET=your_jwt_secret_key`

4. Vercel will automatically detect the **Node.js** app and deploy it! 🎉

---

## 🚧 **Features & Todos** 📝

* [ ] **Forgot password** functionality 🔑
* [ ] **Email verification** 🔍
* [ ] **Role-based access control** (admin vs user) ⚖️

---

## 💬 **Contributing** 🤝

Feel free to fork the repo and create **pull requests** for any new features or bug fixes! 🚀

1. Fork the repo 🍴
2. Create a new branch (`git checkout -b feature-name`) 🌱
3. Make your changes 🛠️
4. Commit and push (`git push origin feature-name`) 🚀
5. Submit a pull request 🙌

---

## 📜 **License** 🧑‍⚖️

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
 
 

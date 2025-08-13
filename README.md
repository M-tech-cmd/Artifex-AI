# Artifex AI 🎨✨

Welcome to **Artifex AI** – your gateway to transforming text into stunning visual masterpieces! Powered by the cutting-edge **Clipdrop APIs** and built with a robust **MERN stack**, Artifex AI offers a seamless and intuitive experience for creators, artists, and anyone looking to bring their ideas to life with AI.

---

## 🌟 Features

* 🖼 **Text-to-Image Generation**: Describe your vision and generate unique images in seconds.
* 💳 **Secure Payment Integration**: Process subscriptions and payments seamlessly via Stripe.
* 🎨 **Fluid User Interface**: Dynamic, responsive, and animated UI with React.js and Framer Motion.
* ⚡ **Robust Backend**: Fast and reliable Node.js + Express.js server.
* 🗄️ **Scalable Database**: MongoDB for flexible data storage.
* 🔐 **User Authentication**: Secure registration and login for personal galleries and subscription management.

---

## 🛠️ Technologies Used

**Frontend:**

* **React.js** – Component-based library for building interfaces.
* **Framer Motion** – Animations and gestures.
* **Tailwind CSS** – Utility-first styling framework.

**Backend:**

* **Node.js** – JavaScript runtime.
* **Express.js** – Web framework.
* **MongoDB** – NoSQL database.
* **Mongoose** – ODM for MongoDB.

**APIs & Services:**

* **Clipdrop APIs** – Core AI engine for text-to-image generation.
* **Stripe** – Payment and subscription management.
* **Postman** – API development and testing.

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or higher recommended)
* npm (v9 or higher) or Yarn
* MongoDB (local or MongoDB Atlas)
* Git

### Installation

```bash
git clone https://github.com/your-username/ArtifexAI.git
cd ArtifexAI
```

### Backend Setup

```bash
cd backend
npm install  # or yarn install
```

Create a `.env` file in `backend/`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIPDROP_API_KEY=your_clipdrop_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
```

Start the backend server:

```bash
npm run dev  # or npm start
```

### Frontend Setup

```bash
cd ../frontend
npm install  # or yarn install
```

Create a `.env` file in `frontend/`:

```
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

Start the frontend development server:

```bash
npm start  # or yarn start
```

Open `http://localhost:3000` in your browser.

---

## 💡 Usage

* **Register/Login**: Access Artifex AI features.
* **Generate Images**: Enter a text prompt in the "Generate" section and create AI-powered visuals.
* **Manage Subscriptions**: Control payment plans via Stripe in the "Billing" section.
* **Explore Gallery**: View your previously generated images.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-feature-name`.
3. Make your changes.
4. Commit: `git commit -m 'feat: Add new feature'`.
5. Push: `git push origin feature/your-feature-name`.
6. Open a Pull Request.

Ensure your code follows project standards and includes appropriate tests.

---

## 📄 License

This project is licensed under the MIT License – see the LICENSE file for details.

---

## 📧 Contact

**Email:** [kimaniemma20@.com](mailto:kimaniemma20@.com)
**GitHub:** [https://github.com/M-tech-cmd](https://github.com/M-tech-cmd)
Made with ❤️ by **M-tech-cmd**

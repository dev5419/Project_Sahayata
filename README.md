# Project Sahayata 🧠

![Status](https://img.shields.io/badge/status-work_in_progress-yellow)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

An open-source digital mental wellness ecosystem designed to provide accessible, confidential, and stigma-free psychological support to college students.

---

## 🌟 About The Project

Mental health challenges among college students are on the rise, yet many institutions, especially in rural and semi-urban areas, lack a structured support system. Project Sahayata aims to bridge this gap by providing a comprehensive digital platform that integrates directly with institutional resources. It serves as a first point of contact, a resource hub, and a safe space for students, while providing anonymized, actionable insights to college administrators.



---

## ✨ Key Features

This platform is built with a modular approach to address the core challenges in student mental health:

* **🤖 AI-Powered Wellness Companion:** An interactive chatbot offering 24/7 psychological first-aid, coping strategies, and crisis intervention referrals.
* **📅 Confidential Booking System:** A secure portal for students to book appointments with on-campus counsellors without fear of judgment.
* **📚 Psychoeducational Resource Hub:** A curated library of articles, videos, and audio guides on mental wellness, available in multiple regional languages.
* **🤝 Moderated Peer Support Forum:** A safe and anonymous space for students to connect, share experiences, and support one another under the guidance of trained peer moderators.
* **📊 Institutional Admin Dashboard:** A privacy-first analytics dashboard that provides administrators with aggregated, anonymized data on campus mental health trends to inform policy and resource allocation.

---

## 💻 Tech Stack

This project is built using a modern JavaScript-based stack.

**Backend:**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB
* **ODM:** Mongoose
* **Authentication:** JSON Web Tokens (JWT)

**Frontend (Planned):**
* **Library:** React.js or Vue.js
* **Styling:** Tailwind CSS or Material-UI

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (v16 or later)
* npm (Node Package Manager)
* MongoDB (local instance or a cloud service like MongoDB Atlas)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/sahayata-backend.git](https://github.com/your-username/sahayata-backend.git)
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd sahayata-backend
    ```
3.  **Install NPM packages:**
    ```sh
    npm install
    ```
4.  **Create a `.env` file** in the root directory and add the following environment variables:
    ```env
    PORT=8080
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_jwt_key
    ```
5.  **Start the server:**
    ```sh
    npm start
    ```
    Your backend server should now be running on `http://localhost:8080`.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` file for more information.

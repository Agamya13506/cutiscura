# cutiscura
This repository contains my DBMS project a skincare product recommendation website

Cutiscura is a skincare management web application designed to help users understand their skin type, identify skin concerns, and receive suitable product recommendations.  
The project focuses on organizing skincare data and providing a simple, user-friendly experience.

---

## Features
- User registration and login
- Skin type selection
- Skin concern identification
- Product recommendations based on skin type and concerns
- Dermatologist and product data management
- Structured relational database

---

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js, Express.js  
- **Database:** MySQL  
- **Tools:** GitHub, MySQL Workbench

---

## Project Structure
cutiscura/
├── backend/
│ ├── server.js
│ ├── routes/
│ └── config/
├── frontend/
│ ├── index.html
│ ├── styles.css
│ └── script.js
├── database/
│ └── cutiscura.sql
├── .gitignore
└── README.md

---

## Database Overview
The database includes the following main tables:
- Users
- Skin Types
- Skin Concerns
- Products
- Dermatologists
- Product Categories

All tables are connected using foreign keys to maintain data consistency.

---

## Setup Instructions
1. Clone the repository
2. Install required Node.js dependencies
3. Create a MySQL database named `cutiscura`
4. Import the provided SQL file into MySQL
5. Create a `.env` file with database credentials
6. Run the server using Node.js

---

## Environment Variables
Create a `.env` file in the backend folder with the following variables:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cutiscura
PORT=3000


---

## Purpose of the Project
This project was created as part of an academic submission to demonstrate:
- Database design and normalization
- Backend–database connectivity
- Basic full-stack web development
- Practical application of DBMS concepts

---

## Future Enhancements
- Quiz-based skin analysis
- Advanced product recommendation logic
- Admin dashboard
- Improved UI/UX
- Deployment on cloud platform

---

## Author
Agamya Singh Chauhan

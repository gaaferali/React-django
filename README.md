

## Description
A full-stack web application built with React and Django REST Framework, The project is a smart system 
designed to simplify and secure the process of buying, selling, and renting residential 
properties. Traditional real estate methods often involve unverified agents and lack direct 
communication between property owners and potential clients, leading to inefficiencies 
and reduced trust. 
The project aims to addresses these challenges by providing a user-friendly 
mobile platform that enables verified property listings, real-time chat between users, and a 
streamlined search experience tailored to the local market. 

## Features
- User authentication (JWT)
- CRUD operations
- Responsive UI
- REST API

## Tech Stack
**Frontend**
- React
- Vite
- Tailwind CSS

**Backend**
- Django
- Django REST Framework
- PostgreSQL
- JWT Authentication

## Installation

### Backend

cd backend
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

cd frontend
npm install
npm run dev
```

Frontend (`.env`)
```env
VITE_API_URL=http://127.0.0.1:8000/api/
```

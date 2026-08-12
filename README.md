

## Description

(i Dockerized the application {4 containers one for the postger and one forn nginx to use proxy server handel the request to the front and backend and contaier for backend and another for front end i have two docker file for the front and another for the packe and i use image for the nginx and the database than i have config file for the nginx } but i have tow feature to add the chating and deals notification and i must edit the api work will with the nginx proxy )
than i will ad IC workflow using git hub actions to run it.
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
- CSS

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

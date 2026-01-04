# CodeAlpha_Social_media_Platform
# 🌐 Mini Social Media Application

## 📌 Project Overview
This is a **Mini Social Media Web Application** that allows users to create profiles, share posts, like and comment on posts, and follow other users.  
The project demonstrates **full-stack web development** using **HTML, CSS, JavaScript** for the frontend and **Django (Python) or Express.js (Node.js)** for the backend, along with a database for persistent storage.

---

## ✨ Features
- User Registration & Login
- User Profile Management
- Create, Edit & Delete Posts
- Like & Unlike Posts
- Comment on Posts
- Follow / Unfollow Users
- News Feed (Posts from followed users)
- Secure Authentication System

---

## 🛠️ Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend (Choose One)
- **Django (Python)**  
  OR  
- **Express.js (Node.js)**

### Database
- SQLite / PostgreSQL (Django)
- MongoDB / MySQL (Express.js)

---

## 📂 Project Structure

### Django Structure
socialmedia/
│── socialmedia/
│── users/
│── posts/
│── templates/
│── static/
│── db.sqlite3
│── manage.py

socialmedia/
│── models/
│── routes/
│── controllers/
│── middleware/
│── public/
│── views/
│── app.js
│── package.json

```bash
git clone https://github.com/username/mini-social-media.git
cd mini-social-media
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

📖 How It Works

User registers and logs in

User creates a profile

User can post text content

Other users can like and comment

Users can follow/unfollow each other

Feed shows posts from followed users

🗄️ Database Design
Users Table

id

username

email

password

profile_picture

bio

Posts Table

id

user_id

content

created_at

Comments Table

id

post_id

user_id

comment_text

created_at

Followers Table

id

follower_id

following_id

Likes Table

id

post_id

user_id

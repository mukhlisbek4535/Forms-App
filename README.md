# Forms App — Survey & Form Builder Platform

A full-stack web application that allows users to **create, share, and analyze forms** (survey, feedback, registration).  
Authenticated creators can design forms with various input types and share public links, while the system handles response collection and analytics.

## 🌐 Live Demo & Repo

- **Live App:** https://forms-app-theta.vercel.app/
- **GitHub Repo:** https://github.com/mukhlisbek4535/Forms-App

## ✨ Features & Highlights

- **Dynamic Form Builder**: create and edit templates with text, choice, dropdown, and date fields
- **Authentication & Authorization**: JWT-based, so only form creators can manage their own forms
- **Public Submission Links**: allow external users to submit responses without signing in
- **REST API Endpoints**: templates, responses, tags/comments, with validation and error handling
- **Data Modeling**: MongoDB/Mongoose models for users, templates, responses, tags, and topics
- **Response Dashboard**: analytics, filtering by tags/topics, and CSV export
- **Search & Tagging**: categorize templates and allow users to filter/search
- **Comments & Likes**: interactive features to engage with responses
- **Enterprise Integration**: Salesforce & Odoo hooks exposed via API for extensibility

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Auth**: JWT (JSON Web Tokens)
- **Extras**: Comments, tags, filters
- **Deployment**: Vercel

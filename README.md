# ReServe

ReServe is a full-stack web application for food donation management. Donors can post surplus food with location and safety details, NGOs can accept and track donations, admins monitor requests and pickups in real-time, and organizations can view verified donation details and track past contributions.

## Workflow / Features

### Donor Side
- Uploads surplus food with preparation time & storage type
- Location auto-detected and donation posted
- Receives pickup confirmation & tracking updates

### NGO Side
- Views live donor list with food safety status
- Accepts suitable donations based on capacity
- Uses in-app navigation for optimized pickup route

### Admin Side
- Monitors all active requests & pickups in real time
- Validates safety alerts and manages vehicle allocation
- Tracks metrics: delivery time, food saved, spoilage rate

### Organisation Side
- Shows verified NGO/orphanage details, location, contact info, and available capacity
- Records past donations with quantity, date, and beneficiary count
- Live status tracking of donations

## Technologies Used
- Frontend: React.js, Tailwind CSS / Bootstrap  
- Backend: Node.js + Express.js, Flask API  
- Machine Learning: Python (scikit-learn, pandas, numpy), Flask REST API  
- APIs & Tools: Google Maps API, Distance Matrix API  
- Database: MongoDB / Firebase  
- DevOps: Docker, GitHub Actions (optional)

## Screenshots

### Login Page
![Login Page](Reserve/Screenshot_2025-12-26_222246.png)

### User Selection (NGO / Donor / Organization / Admin)
![User Selection](Reserve/Screenshot_2025-12-26_222302.png)

### Donor Dashboard / Donate Food / Donation History
![Donor Dashboard ](Reserve/Screenshot_2025-12-26_222413.png)
![Donate Dashboard 2](Reserve/Screenshot_2025-12-26_222441.png)
![Donate Food](Reserve/Screenshot_2025-12-26_222457.png)
![Donation History](Reserve/Screenshot_2025-12-26_222630.png)

### NGO Dashboard / Find Food / Distribute
![NGO Find Food](Reserve/Screenshot_2025-12-26_222516.png)
![NGO Map route](Reserve/Screenshot_2025-12-26_222556.png)
![NGO Distribute Food](Reserve/Screenshot_2025-12-26_222653.png)

### Organization Dashboard
![Organization Dashboard](Reserve/Screenshot_2025-12-26_222719.png)

### Admin DashBoard
![Admin Dashboard](Reserve/Screenshot_2025-12-26_222742.png)
![Admin User Management](Reserve/Screenshot_2025-12-26_222756.png)

# Smart Attendance Management System

A production-ready, enterprise-grade Smart Attendance Management System built for colleges, universities, training institutes, and academic departments.

> **Development Mode Notice:** This project is being developed using a strict **Phase-by-Phase** methodology.
> Phase 0 (Analysis) and Phase 1 (Project Foundation) are fully completed.

---

## Technical Architecture

```
React (Vite + TS + Tailwind CSS)
            │
            ▼ REST APIs (/api/v1/*)
Spring Boot 3.4.2 (Java 21 + Spring Security + JWT)
            │
            ▼ Spring Data JPA / Hibernate
     MySQL 8.0 Database
```

---

## Technology Stack

### Frontend
- **Framework:** React 19, Vite, TypeScript
- **Styling:** Tailwind CSS v4, OKLCH design system, Radix UI (Shadcn UI primitives)
- **Routing:** TanStack Router (`@tanstack/react-router`)
- **Icons & Charts:** Lucide React, Recharts
- **HTTP Client:** Centralized Axios / Fetch API Client (`src/lib/api-client.ts`)

### Backend
- **Core:** Java 21, Spring Boot 3.4.2
- **Security:** Spring Security, JWT (Stateless authentication ready for Phase 3), BCrypt
- **Database Access:** Spring Data JPA, Hibernate, MySQL Driver
- **Documentation:** Swagger UI / OpenAPI (`/swagger-ui.html`)
- **Utilities:** Lombok, ModelMapper, ZXing (QR Code generation), Apache POI (Excel), OpenPDF (PDF)

### Database
- **Database:** MySQL 8.0 (`smart_attendance_db`)

---

## Folder Structure

```
smart-attendance-system/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/mentormatrix/
│   │   │   │   ├── config/          # Security, ModelMapper, Auditing, Swagger
│   │   │   │   ├── controller/      # Health, Auth, Student, Admin, Attendance
│   │   │   │   ├── dto/             # Request & Response payloads
│   │   │   │   ├── entity/          # BaseEntity, Student, Admin, Attendance, DailyQRCode, etc.
│   │   │   │   ├── enums/           # Role (STUDENT, FACULTY, ADMIN), AttendanceStatus
│   │   │   │   ├── exception/       # GlobalExceptionHandler, Custom exceptions
│   │   │   │   ├── filter/          # JwtAuthenticationFilter
│   │   │   │   ├── repository/      # Spring Data JPA repositories
│   │   │   │   ├── security/        # CustomUserDetails, CustomUserDetailsService, JwtUtil
│   │   │   │   ├── service/         # Service interfaces & implementations
│   │   │   │   └── util/            # FileUploadUtil, QRCodeGeneratorUtil
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── .env.example
│   └── pom.xml
├── src/                             # Frontend source
│   ├── components/                  # UI Primitives & Layout (Topbar, Sidebar, AuthShell)
│   ├── lib/                         # API Client (`api-client.ts`), App Context, Utils
│   └── routes/                      # Page components & routing tree
├── .env.example                     # Environment variables template
├── package.json
└── vite.config.ts
```

---

## Prerequisites

- **Java Development Kit:** JDK 21+
- **Node.js:** v18+ or v20+
- **Package Manager:** npm or bun
- **Database:** MySQL Server 8.0+

---

## Environment Configuration

Copy `.env.example` to your environment or configure environment variables:

```bash
DB_NAME=smart_attendance_db
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=SmartAttendanceSecretKeyForJWTTokenGenerationMustBeAtLeast256BitsLong2026SecureKey
VITE_API_BASE_URL=http://localhost:8085/api/v1
```

---

## How to Run

### 1. Backend (Spring Boot)

```bash
cd backend
mvn clean compile
mvn spring-boot:run
```

* Backend running at: `http://localhost:8085/api/v1`
* Health Check Endpoint: `http://localhost:8085/api/v1/health`
* Swagger OpenAPI Docs: `http://localhost:8085/api/v1/swagger-ui.html`

### 2. Frontend (Vite React)

```bash
npm install
npm run dev
```

* Frontend running at: `http://localhost:8082` (or available local Vite port)

---

## Phase 1 Health Check Verification

* **Endpoint:** `GET http://localhost:8085/api/v1/health`
* **Response Envelope:**
```json
{
    "success": true,
    "message": "Smart Attendance System API is running",
    "data": null,
    "timestamp": "2026-08-09T15:30:00"
}
```

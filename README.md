# Flexi ID - Employee Card Generator

A comprehensive employee ID card generation system built with Next.js, TypeScript, and Prisma.

## Features

- **Authentication**: Secure login system with NextAuth.js
- **Employee Management**:
  - Individual employee registration with detailed onboarding form
  - Bulk import via CSV file
  - Photo upload for employee pictures
- **Template Management**:
  - Upload custom front and back card templates
  - Dynamic field positioning
  - Multiple template support
- **Card Generation**:
  - Dynamic text overlay on templates
  - QR code generation (links to company website)
  - Individual PNG download
  - Batch ZIP download for multiple cards
- **Dashboard**: Overview of employees, generated cards, and quick actions

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Image Processing**: Canvas API, Sharp
- **QR Code**: qrcode library

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Flexi-Id
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Initialize the database:
```bash
npm run db:push
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Login Credentials

- **Email**: admin@flexiid.com
- **Password**: admin123

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Dashboard pages
├── components/            # React components
│   ├── layout/           # Layout components (Sidebar, Header)
│   └── ui/               # UI components (Button, Input, etc.)
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── card-generator.ts # Card generation logic
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
└── types/                 # TypeScript type definitions

prisma/
├── schema.prisma         # Database schema
└── seed.ts              # Database seed script

public/
├── uploads/             # Uploaded files
│   ├── photos/         # Employee photos
│   └── templates/      # Card templates
└── generated/          # Generated card images
```

## Card Template Guidelines

### Recommended Specifications
- **Size**: 638 x 1011 pixels (standard ID card ratio)
- **Format**: PNG or JPG

### Front Card Fields
- Employee photo
- First name, Last name
- Designation (with letter spacing)
- Employee ID
- Department
- Contact number

### Back Card Fields
- QR Code (company website)
- Employee ID
- Department
- City
- Date of Joining
- Date of Birth
- Mobile number
- CNIC
- Blood Group
- Emergency Contact
- Static company footer

## API Endpoints

### Employees
- `GET /api/employees` - List all employees
- `POST /api/employees` - Create employee
- `GET /api/employees/[id]` - Get employee details
- `PUT /api/employees/[id]` - Update employee
- `DELETE /api/employees/[id]` - Delete employee
- `POST /api/employees/import` - Bulk import from CSV

### Templates
- `GET /api/templates` - List all templates
- `POST /api/upload/template` - Upload template
- `PUT /api/templates/[id]` - Update template
- `DELETE /api/templates/[id]` - Delete template

### Cards
- `POST /api/cards/generate/[id]` - Generate card for employee
- `POST /api/cards/batch` - Batch generate cards
- `POST /api/cards/download` - Download cards as ZIP

## CSV Import Format

```csv
employeeId,firstName,lastName,designation,department,city,contactNumber,mobileNumber,cnic,bloodGroup,emergencyContact,dateOfBirth,dateOfJoining
8009654,Muhammad,Talha,Graphic Designer,Product,Islamabad,+92 345 778 9876,+92 321 456 7890,31201-9822345-5,B-,+92 345 678 9900,1994-04-08,2025-07-10
```

## License

MIT

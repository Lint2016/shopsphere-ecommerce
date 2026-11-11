# ShopSphere

**Discover more. Shop smarter.**

ShopSphere is a modern e-commerce portfolio project focused on building and operating a scalable online retail application using cloud infrastructure and production-oriented engineering practices.

The initial phase establishes the customer-facing frontend using React and Vite. Future phases will introduce backend services, AWS infrastructure, containerization, CI/CD and operational practices.

## Project objectives

- Build a responsive and maintainable e-commerce application.
- Separate application logic, product data and presentation.
- Establish a foundation for backend integration.
- Design and implement scalable AWS infrastructure using Terraform.
- Demonstrate cloud networking, compute, storage, databases and deployment.
- Apply security, reliability, monitoring and cost-management principles.
- Document architecture decisions, trade-offs and operational procedures.

## Technology stack

**Current frontend**
- React
- Vite
- JavaScript
- Custom CSS
- ESLint

**Planned cloud technologies**
- AWS
- Terraform
- Docker
- Python
- GitHub Actions

## Current application scope

- Responsive navigation.
- Homepage and promotional sections.
- Product category sections.
- Featured product cards.
- Search interface.
- Cart display.
- Responsive desktop and mobile layouts.

Product information currently uses temporary demonstration data.

No production backend, persistent customer accounts or real payment processing has been implemented.

## Repository structure

```text
shopsphere-ecommerce/
├── public/
├── src/
│   ├── components/
│   ├── data/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── styles/
│   └── utils/
├── docs/
├── tests/
├── .github/
│   └── workflows/
├── index.html
├── package.json
└── vite.config.js
```

## Run locally

Requirements: Node.js, npm and Git.

```bash
git clone https://github.com/Lint2016/shopsphere-ecommerce.git
cd shopsphere-ecommerce
npm install
npm run dev
```

Open `http://localhost:5173/`.

## Available commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build production frontend |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project roadmap

| Phase | Scope | Status |
|---|---|---|
| 0 | Project planning and requirements | In progress |
| 1 | React storefront foundation | Implemented |
| 2 | Product catalogue and frontend functionality | Planned |
| 3 | Initial static hosting | Planned |
| 4 | AWS architecture and infrastructure | Planned |
| 5 | Backend and database implementation | Planned |
| 6 | Containerization and CI/CD | Planned |
| 7 | Security, reliability and operational testing | Planned |
| 8 | Technical documentation and portfolio preparation | Planned |

## Engineering approach

The project prioritizes:

- Infrastructure as Code.
- Least-privilege access.
- Secure configuration and secrets management.
- Reusable and maintainable components.
- Automated testing and deployment.
- Monitoring and operational visibility.
- Cost-aware architectural decisions.
- Documented architecture decisions and trade-offs.

## Project status

ShopSphere is currently in its frontend foundation phase. No AWS infrastructure or production backend has been deployed yet.

---

**ShopSphere — Discover more. Shop smarter.**
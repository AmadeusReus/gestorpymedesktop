# GestorPyME Desktop

A modern desktop application for managing small and medium-sized pharmacies (PyMEs).
Built with Electron, React, and PostgreSQL with professional architecture and comprehensive documentation.

[![Version](https://img.shields.io/badge/version-0.9.3-blue)](https://github.com/AmadeusReus/gestorpymedesktop/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Node](https://img.shields.io/badge/node-18%2B-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.2-blue)](https://www.typescriptlang.org/)

## 🎯 Overview

GestorPyME is a desktop application designed to streamline daily operations in small pharmacies. It handles employee shifts, cash management, transactions (sales, expenses, digital payments), and provides comprehensive audit trails for compliance and reconciliation.

**Current Status:** 60% complete - Active development

## ✨ Key Features

### Employee Cash Management (CU-1) ✅
- Daily shift creation and closing with validation
- Cash count reconciliation against POS/digital payments
- Automatic difference calculation (surplus/shortage)
- Transaction history and summaries per shift
- Multi-shift daily management

### Role-Based Access Control
- **Admin**: Full system management, multi-business access
- **Supervisor**: Daily review, shift validation, closing authorization
- **Employee**: Personal shift and transaction management

### Catalog Management
- Supplier directory
- Expense type definitions
- Digital payment method configuration
- CRUD operations with validation

### Audit & Compliance
- Complete transaction audit trail
- User action logging
- Day closing and review workflow
- Shift-level and daily summaries

## 📊 Project Status

| Component | Progress | Status |
|-----------|----------|--------|
| Frontend | 60-85% | Core screens complete, bug fixes in progress |
| Backend | 45% | Essential handlers implemented |
| Testing | 50% | Unit tests + E2E framework setup |
| Documentation | 100% | Comprehensive (25+ documents) |
| **Overall** | **60%** | **Active Development** |

### Recent Work (Session 7 - November 2025)
- ✅ **Fixed 3 critical bugs** in cash calculation logic
- ✅ **Completed CU-1 testing** (Employee Cash Closing flow)
- ✅ **26 backend handlers** fully implemented
- ✅ **Session summary** created for daily reconciliation
- ⏳ **Pending:** Complete regression testing of bug fixes

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0 or higher
- PostgreSQL 12 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AmadeusReus/gestorpymedesktop.git
cd gestorpymedesktop
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your database credentials
# For development, PostgreSQL should be running locally
```

4. **Initialize database**
```bash
node scripts/setup-wizard.mjs
```

5. **Start development server**
```bash
npm run dev
```

The application will open in a new Electron window.

## 📚 Documentation

Complete documentation is available in the `/docs` folder, organized by feature and topic:

### 🎯 Start Here
- **[English Documentation](docs/README-MASTER.md)** - Navigation guide for all docs
- **[Project Status](docs/02-referencia/STATUS.md)** - What's implemented vs. pending
- **[Quick Start Guide](docs/01-guias-rapidas/QUICK-START.md)** - Getting up to speed

### 🏗️ Technical Documentation
- **[Architecture Guide](docs/10-arquitectura/ARQUITECTURA-FRONTEND.md)** - Design patterns and data flow
- **[Code Map](docs/02-referencia/MAPA-CODEBASE.md)** - File structure and locations
- **[Frontend Components](docs/10-arquitectura/FRONTEND-COMPONENTS.md)** - Component reference

### 🧪 Testing & Quality
- **[Testing Guide](docs/07-testing-automatizado/TEST-GUIDE.md)** - Running automated tests
- **[Manual Testing Guide](docs/07b-pruebas-manuales/README.md)** - Step-by-step testing procedures
- **[Recent Fixes](docs/03-bugs/BUG-SESION7-FIXES-IMPLEMENTADOS.md)** - Current bug fixes

### 💾 Database & Setup
- **[Database Setup](docs/08-base-datos/DB-SETUP.md)** - PostgreSQL configuration and troubleshooting
- **[Scripts Reference](docs/11-scripts-desarrollo/SCRIPTS.md)** - Utility scripts overview

## 🛠️ Technology Stack

### Frontend
- **React** 18.2 - UI library
- **TypeScript** 5.2 - Type safety
- **Vite** 7.2 - Build tool and dev server
- **CSS-in-JS** - Component styling

### Backend / Desktop
- **Electron** 39.1 - Desktop framework
- **Node.js** - JavaScript runtime
- **PostgreSQL** - Database
- **IPC** - Inter-process communication

### Testing
- **Jest** - Unit testing framework
- **Cypress** - End-to-end testing
- **Testing Library** - Component testing utilities

## 📦 Available Scripts

### Development
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Check code style
```

### Testing
```bash
npm run test       # Run unit tests
npm run test:watch # Run tests in watch mode
npm run test:coverage # Generate coverage report
npx cypress open   # Open Cypress test runner
npx cypress run    # Run E2E tests headless
```

### Database
```bash
node scripts/setup-wizard.mjs      # Interactive setup
node scripts/reset-bd-prueba.mjs   # Reset test data
node scripts/test-handlers.mjs      # Test handlers
```

## 🐛 Known Issues & Current Fixes

### Session 7 Fixes (Testing Pending)
The following critical issues have been identified and fixed:

1. **Cash calculations** - Now properly include all payment methods in transaction totals
2. **POS accumulation** - Fixed incorrect value carry-over across multiple shifts
3. **Display inconsistencies** - Corrected UI display of closed shift summaries

See [Detailed Bug Fixes](docs/03-bugs/BUG-SESION7-FIXES-IMPLEMENTADOS.md) for technical details.

## 📋 Future Work

### High Priority
- [ ] Implement missing critical handlers (`negocio:getByUser`, `dia-contable:*`)
- [ ] Complete regression testing of Session 7 fixes
- [ ] Add robust input validation across all handlers

### Medium Priority
- [ ] Comprehensive E2E test suite
- [ ] User authorization validation on all operations
- [ ] Error message improvements

### Lower Priority
- [ ] Performance optimization
- [ ] Responsive mobile design
- [ ] PDF/Excel report generation
- [ ] Multi-language support

## 🏦 Business Context

This project is a personal learning initiative in modern desktop development. It's being gifted to a local pharmacy as a working solution for daily operational management.

### Key Business Rules Implemented
- Daily shift-based cash management
- Multi-method reconciliation (Cash + POS + Digital Payments)
- Role-based permissions (Admin, Supervisor, Employee)
- Timezone-aware date handling for international deployment
- Comprehensive audit trail for compliance

## 🤝 Contributing

This is a personal project, but insights and suggestions are welcome. Feel free to open issues for bugs or feature requests.

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 📞 Contact & Questions

For questions about the codebase, architecture, or specific implementations, refer to the comprehensive documentation in the `/docs` folder.

---

## 🎓 Development Notes

### Project Structure
```
gestorpymedesktop/
├── src/                    # React frontend
│   ├── components/        # Reusable components
│   ├── screens/          # Full-page screens
│   ├── hooks/            # Custom React hooks
│   └── styles/           # CSS styling
├── electron/             # Electron backend
│   ├── handlers/         # IPC handlers
│   ├── repositories/     # Data access layer
│   └── services/         # Business logic
├── docs/                 # Comprehensive documentation
├── scripts/              # Utility scripts
└── cypress/              # E2E tests
```

### Development Workflow
1. Create a feature branch from `main`
2. Implement changes with tests
3. Run `npm run lint` to verify code style
4. Run tests: `npm run test` and `npm run test:e2e`
5. Update documentation
6. Create meaningful commit messages
7. Submit for review

### Code Quality Standards
- TypeScript for type safety
- Meaningful variable and function names
- Comprehensive comments for complex logic
- Test coverage for critical paths
- Updated documentation with changes

---

**Last Updated:** November 2025
**Current Version:** 0.9.3
**Status:** Active Development

Made with ❤️ for local pharmacy management

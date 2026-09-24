# OliTechs PMS & POS Platform

Local-first hotel PMS/POS with a separate central licensing and customer onboarding platform.

## Interfaces

- `/` — local hotel PMS & POS
- `/admin` — protected hotel administrator area
- `/platform-admin` — protected OliTechs central platform administrator
- `/signup` — public customer sign-up and package selection page

## Central platform features

- Protected platform administrator login
- Hotel registration and approval workflow
- Public customer registration
- Standard, Premium and Professional packages
- Package pricing, room limits, feature permissions and trial days editable by platform admin
- 7-day free trial by default
- Company subscription status, expiry and room-limit controls
- Hotel administrator username and password provisioning
- Local installation sync for approved package, subscription and hotel admin credentials
- Central audit log
- Registration source tracking
- WhatsApp platform support button: +254 745 043 121

## Customer sign-up flow

1. Customer opens `/signup`.
2. Customer selects a package.
3. Customer submits hotel and administrator details.
4. The platform creates a pending registration and attaches the selected package and trial period.
5. Platform admin reviews the hotel, approves it, and can provision the hotel administrator account.
6. When the hotel installation registers/syncs with the central platform, the approved package, subscription and administrator account are applied locally.

## Development credentials

Central platform admin:

- Username: `platformadmin`
- Password: `Platform@123`

Hotel local admin remains:

- Username: `admin`
- Password: `Admin@123`

Change development credentials before any real deployment.

## Important production note

The central licensing service in this build is a functional local development reference. It stores platform data in JSON and uses in-memory sessions. A production deployment should use HTTPS, persistent PostgreSQL storage, secure password hashing/secret management, persistent sessions, rate limiting, automated backups, payment-provider webhooks and a controlled background sync/heartbeat service.

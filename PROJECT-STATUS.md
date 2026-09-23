# OliTechs PMS & POS — protected administrator build

This build adds a separate protected Administrator Dashboard with:
- Company registration stored on the local installation
- Company registration review, approval and rejection
- Access gate for non-admin hotel users until company approval
- Subscription and paywall monitoring
- Thermal printer configuration by network IP/port
- Bluetooth and USB/wired printer support through the Windows printer queue
- Printer destinations for Reception, Kitchen, Bar, Restaurant and Other
- Document routing for Orders, Bills and Receipts
- Network ESC/POS test printing and Windows queue printing
- Audit logging for print actions

The current local adapter remains JSON for test deployment. PostgreSQL production persistence still requires the database adapter to be completed and enabled.

Build a new full-stack feature for the Markas Surabaya website.

Feature request: $ARGUMENTS

Follow this checklist:
1. Backend model in `backend/models/` (Sequelize)
2. Backend controller in `backend/controllers/` with snake_case functions
3. Register routes in `backend/routes/routes.js` — check for conflicts first
4. Frontend Vue component/view in `frontend/src/views/` or `components/`
5. Register route in `frontend/src/router/index.js` if it's a new page
6. Add `meta: { requiresAuth: true }` and role guard if needed
7. Use `api` from `src/axios.js` for all API calls in the frontend
8. Create NOTIFIKASI records for any booking/event status changes

Use snake_case for all JS/Vue code. DB column names stay UPPERCASE.
Do not break any existing routes or models.

# AMAN Backend Build Guide

This frontend is wired to placeholder Django REST Framework endpoints. Keep the endpoint names below so the frontend and backend can be mapped end-to-end.

## Architecture

- Backend framework: Django + Django REST Framework
- Auth: JWT with SimpleJWT
- Realtime contact: Django Channels for chats and notifications
- Storage: Django local media storage for property images and documents
- Database tables from the PDF: `users`, `properties`, `property_images`, `wished_property`, `chats`, `chat_messages`, `deals`, `notifications`, `fair_price_averages`

## Apps To Create

1. `accounts`: registration, login, edit information, logout
2. `properties`: add property, manage property, offer display, search, search filter
3. `recommendations`: saved seeker criteria and match notifications
4. `pricing`: fair price average calculations
5. `messaging`: chats and chat messages
6. `deals`: deal requests, status changes, ratings
7. `reports`: admin owner, seeker, and property reports

## Placeholder Endpoint Contract

- `POST /api/fr-01/registration/`
- `POST /api/fr-02/login/`
- `PATCH /api/fr-03/edit-information/`
- `POST /api/fr-04/add-property/`
- `GET /api/fr-05/manage-property/`
- `DELETE /api/fr-05/manage-property/<property_id>/`
- `PATCH /api/fr-05/manage-property/<property_id>/validity/`
- `POST /api/fr-06/search-for-property/`
- `POST /api/fr-07/search-filter/`
- `GET /api/fr-08/offer-display/`
- `GET /api/fr-08/offer-display/<property_id>/`
- `POST /api/fr-09/offer-recommendation/`
- `POST /api/fr-10/fair-price-average/`
- `GET /api/fr-11/contact/`
- `POST /api/fr-11/contact/messages/`
- `GET /api/fr-12/deals/`
- `POST /api/fr-12/deals/`
- `PATCH /api/fr-12/deals/<deal_id>/`
- `GET /api/fr-13/reports/?type=owners`
- `GET /api/fr-13/reports/?type=seekers`
- `GET /api/fr-13/reports/?type=properties`
- `POST /api/fr-14/logout/`

## Model Notes

- `User`: full name, username, email, phone number, ID number, role, password hash
- `Property`: owner, transaction type, property type, state, city, bedrooms, bathrooms, price, location, area, description, status, timestamps
- `PropertyImage`: property, image file
- `WishedProperty`: seeker, transaction type, property type, city, bedrooms, bathrooms, preferred price
- `Chat`: property, seeker, owner, timestamps
- `ChatMessage`: chat, sender user, message text, read timestamp
- `Deal`: seeker, owner, property, status, done timestamp, rating fields
- `Notification`: user, property, message, read state
- `FairPriceAverage`: criteria and calculated average price

## Suggested Build Order

1. Create Django project and apps, configure PostgreSQL, media storage, CORS, DRF, and SimpleJWT.
2. Implement `accounts` first so the frontend can store real JWT tokens.
3. Implement property CRUD and media upload endpoints.
4. Add search and filter endpoints using querysets over `properties`.
5. Add offer display and offer detail endpoints.
6. Add saved recommendation criteria and notification generation.
7. Add fair price average endpoint by aggregating similar property prices.
8. Add chats and messages, then upgrade to Django Channels.
9. Add deal request, status update, and rating flows.
10. Add admin reports and protect them with admin permissions.

# Nuxt Supabase Photo Gallery

This is a full-stack photo gallery application built with Nuxt 3 and Supabase.

## Live Demo

**URL**: [https://nuxt-photo.vercel.app](https://nuxt-photo.vercel.app)

## Test Accounts

We have pre-configured the following accounts for testing purposes.
**Password for all accounts**: `password`

### Admin Accounts
*Can view all photos, manage users, and ban users.*
- `admin@test.com`
- `admin2@test.com`

### User Accounts
*Can only view and manage their own uploaded photos.*
- `user1@test.com`
- `user2@test.com`
- `user3@test.com`

## Features

- **Secure Authentication**: Supabase Auth with Role-Based Access Control (RBAC).
- **Server-Side Security**: All database operations (CRUD) are handled via secure Nuxt Server APIs.
- **Image Management**: Upload, view, rename, and delete photos.
- **Admin Dashboard**: Manage users, view statistics, and moderate content.
- **Unit Tests**: Comprehensive Zod schema validation tests using Vitest.

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run unit tests
npm test
```

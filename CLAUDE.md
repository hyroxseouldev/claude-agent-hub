# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Agent Hub is a Next.js 15.4.4 application for sharing and managing AI agent markdown files. Users can register, share, and discover AI agents organized by categories.

## Common Commands

- `pnpm run dev` - Start development server with Turbopack
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint

## Architecture

### Tech Stack

- **Framework**: Next.js 15.4.4 with App Router
- **Authentication**: Clerk (@clerk/nextjs)
- **Database**: Neon PostgreSQL with Drizzle ORM
- **UI**: shadcn/ui components with Tailwind CSS v4
- **Forms**: react-hook-form with zod validation
- **Styling**: Tailwind CSS with next-themes for dark mode

### Project Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/components/ui/` - shadcn/ui components (centralized, reusable)
- `src/db/` - Database configuration and schema (Drizzle ORM)
- `src/lib/` - Utility functions
- `spec/` - Project requirements and design specifications

### Database Schema

The main entity is an `agents` table with:

- Categories (Design, Development, Test, Other)
- Input/output prompts
- Agent name and timestamps
- User information (via Clerk)

### Key Features

- User authentication with Clerk (SignIn/SignUp/UserButton in header)
- Agent file registration and sharing
- Category-based filtering
- Pagination (20 items per page)
- Copy-to-clipboard functionality
- Form validation with page exit prevention
- Using server action

### Pages

- `/` - Main page with agent listings and filtering
- `/create` - Agent creation form
- `/[id]` - Agent detail page

## Development Notes

- Uses Turbopack for faster development builds
- Components follow shadcn/ui patterns with centralized, reusable design
- Database connection requires `DATABASE_URL` environment variable for Neon
- Authentication state managed by Clerk's built-in components
- Simple white and black theme as per design specifications

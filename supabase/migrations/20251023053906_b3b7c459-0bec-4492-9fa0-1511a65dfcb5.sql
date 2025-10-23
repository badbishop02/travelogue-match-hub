-- Phase 4 & 5 Part 1: Add admin role to enum (must be separate transaction)
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'admin';
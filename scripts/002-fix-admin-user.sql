-- First, let's drop the existing admin user if it exists
DELETE FROM users WHERE email = 'admin@pixelforge.com';

-- Create the admin user with a properly hashed password
-- This will be handled by the API route instead

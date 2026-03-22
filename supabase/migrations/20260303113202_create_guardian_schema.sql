/*
  # AI Guardian - Women Safety App Schema

  ## Overview
  Complete database schema for the AI Guardian women safety application with AI-powered
  threat detection, emergency alerts, and location tracking.

  ## New Tables
  
  ### 1. profiles
  User profiles with emergency settings and preferences
  - `id` (uuid, primary key) - Links to auth.users
  - `full_name` (text) - User's full name
  - `phone_number` (text) - Contact phone number
  - `auto_escalate` (boolean) - Enable auto-escalation
  - `escalate_delay_minutes` (integer) - Minutes before escalation
  - `created_at` (timestamptz) - Profile creation time
  - `updated_at` (timestamptz) - Last update time

  ### 2. trusted_contacts
  Emergency contacts who receive alerts
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Profile owner
  - `name` (text) - Contact name
  - `phone_number` (text) - Contact phone
  - `email` (text) - Contact email
  - `priority` (integer) - Alert priority order (1=highest)
  - `created_at` (timestamptz)

  ### 3. sos_alerts
  History of all SOS alerts triggered
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - User who triggered alert
  - `alert_type` (text) - 'manual', 'ai_detected', 'auto_escalated'
  - `threat_level` (text) - 'low', 'medium', 'high', 'critical'
  - `latitude` (decimal) - Location latitude
  - `longitude` (decimal) - Location longitude
  - `address` (text) - Readable address
  - `detected_keywords` (text[]) - AI-detected distress keywords
  - `status` (text) - 'active', 'resolved', 'false_alarm'
  - `resolved_at` (timestamptz) - When alert was resolved
  - `created_at` (timestamptz) - Alert trigger time

  ### 4. safe_zones
  Nearby safe locations (police, hospitals, etc.)
  - `id` (uuid, primary key)
  - `name` (text) - Location name
  - `type` (text) - 'police_station', 'hospital', 'fire_station', 'shelter'
  - `address` (text) - Full address
  - `latitude` (decimal) - Location latitude
  - `longitude` (decimal) - Location longitude
  - `phone_number` (text) - Contact phone
  - `is_24_7` (boolean) - Open 24/7
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Safe zones are publicly readable
  - Trusted contacts restricted to owner
  - SOS alerts restricted to owner
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone_number text,
  auto_escalate boolean DEFAULT true,
  escalate_delay_minutes integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trusted_contacts table
CREATE TABLE IF NOT EXISTS trusted_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  phone_number text NOT NULL,
  email text,
  priority integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create sos_alerts table
CREATE TABLE IF NOT EXISTS sos_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  alert_type text NOT NULL DEFAULT 'manual',
  threat_level text NOT NULL DEFAULT 'high',
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  address text,
  detected_keywords text[],
  status text DEFAULT 'active',
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create safe_zones table
CREATE TABLE IF NOT EXISTS safe_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  address text NOT NULL,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  phone_number text,
  is_24_7 boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_zones ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trusted contacts policies
CREATE POLICY "Users can read own contacts"
  ON trusted_contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts"
  ON trusted_contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON trusted_contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON trusted_contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- SOS alerts policies
CREATE POLICY "Users can read own alerts"
  ON sos_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts"
  ON sos_alerts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON sos_alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Safe zones policies (publicly readable)
CREATE POLICY "Anyone can read safe zones"
  ON safe_zones FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_user_id ON trusted_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_user_id ON sos_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_status ON sos_alerts(status);
CREATE INDEX IF NOT EXISTS idx_safe_zones_type ON safe_zones(type);
CREATE INDEX IF NOT EXISTS idx_safe_zones_location ON safe_zones(latitude, longitude);

-- Insert sample safe zones (placeholder data)
INSERT INTO safe_zones (name, type, address, latitude, longitude, phone_number, is_24_7)
VALUES
  ('Central Police Station', 'police_station', '123 Main St, City Center', 28.6139, 77.2090, '100', true),
  ('City General Hospital', 'hospital', '456 Health Ave, Medical District', 28.6229, 77.2195, '102', true),
  ('Emergency Services Hub', 'fire_station', '789 Safety Blvd, Downtown', 28.6340, 77.2249, '101', true),
  ('Women''s Shelter', 'shelter', '321 Care Lane, Safe Zone', 28.6050, 77.1987, '1091', true)
ON CONFLICT (id) DO NOTHING;
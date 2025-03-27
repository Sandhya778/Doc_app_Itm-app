# Supabase Database Setup for MediSchedule

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up or log in
2. Create a new project
3. Note your project URL and anon key (to be added to app.js)

## 2. Set Up Authentication

1. Go to Authentication → Settings
2. Enable Email provider (if not already enabled)
3. Configure any additional providers as needed

## 3. Create Database Tables

Use the SQL editor in Supabase to create the following tables:

### Locations Table
```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample locations
INSERT INTO locations (name, address, city, state, zip) VALUES
  ('Downtown Medical Center', '123 Main St', 'Austin', 'TX', '78701'),
  ('Westside Health Clinic', '456 West Ave', 'Austin', 'TX', '78703'),
  ('Northview Medical Plaza', '789 North Blvd', 'Austin', 'TX', '78752');
```

### Doctors Table
```sql
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  location_id UUID REFERENCES locations(id),
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample doctors
INSERT INTO doctors (name, specialty, location_id, bio) VALUES
  ('Dr. John Smith', 'Cardiology', (SELECT id FROM locations WHERE name = 'Downtown Medical Center'), 'Experienced cardiologist with over 15 years of practice'),
  ('Dr. Maria Rodriguez', 'Pediatrics', (SELECT id FROM locations WHERE name = 'Westside Health Clinic'), 'Specialized in pediatric care for infants and young children'),
  ('Dr. Robert Johnson', 'Dermatology', (SELECT id FROM locations WHERE name = 'Northview Medical Plaza'), 'Board certified dermatologist focusing on skin conditions'),
  ('Dr. Sarah Lee', 'Neurology', (SELECT id FROM locations WHERE name = 'Downtown Medical Center'), 'Specializes in neurological disorders and treatments'),
  ('Dr. Michael Wong', 'Orthopedics', (SELECT id FROM locations WHERE name = 'Westside Health Clinic'), 'Expert in sports injuries and joint replacements');
```

### Available Slots Table
```sql
CREATE TABLE available_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create some sample time slots for each doctor over the next 7 days
DO $$
DECLARE
  doctor_rec RECORD;
  current_date DATE := CURRENT_DATE;
  slot_date DATE;
BEGIN
  FOR doctor_rec IN SELECT id FROM doctors LOOP
    FOR i IN 0..7 LOOP -- next 7 days
      slot_date := current_date + i;
      
      -- Morning slots
      INSERT INTO available_slots (doctor_id, date, start_time, end_time)
      VALUES 
        (doctor_rec.id, slot_date, '09:00', '09:30'),
        (doctor_rec.id, slot_date, '09:30', '10:00'),
        (doctor_rec.id, slot_date, '10:00', '10:30'),
        (doctor_rec.id, slot_date, '10:30', '11:00');
        
      -- Afternoon slots
      INSERT INTO available_slots (doctor_id, date, start_time, end_time)
      VALUES 
        (doctor_rec.id, slot_date, '13:00', '13:30'),
        (doctor_rec.id, slot_date, '13:30', '14:00'),
        (doctor_rec.id, slot_date, '14:00', '14:30'),
        (doctor_rec.id, slot_date, '14:30', '15:00');
    END LOOP;
  END LOOP;
END $$;
```

### Appointments Table
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  slot_id UUID REFERENCES available_slots(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. Set Up Row Level Security (RLS)

For proper security, implement Row Level Security policies:

### For Doctors and Locations Tables
```sql
-- Enable RLS
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public doctors access" ON doctors
  FOR SELECT USING (true);

CREATE POLICY "Public locations access" ON locations
  FOR SELECT USING (true);
```

### For Available Slots Table
```sql
-- Enable RLS
ALTER TABLE available_slots ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public slots read access" ON available_slots
  FOR SELECT USING (true);

-- Create policy for admin write access
CREATE POLICY "Admin slots write access" ON available_slots
  FOR UPDATE USING (auth.role() = 'authenticated');
```

### For Appointments Table
```sql
-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policy for user's own appointments
CREATE POLICY "Users can view their own appointments" ON appointments
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for creating appointments
CREATE POLICY "Users can create appointments" ON appointments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy for users updating their own appointments
CREATE POLICY "Users can update their own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = user_id);
```

## 5. Create API Access

1. Go to API settings in your Supabase dashboard
2. Review and enable the necessary APIs for your tables
3. Make sure RLS policies are properly set up to secure your data

## 6. Update app.js Configuration

Update the Supabase URL and anon key in your app.js file with the values from your project:

```javascript
const SUPABASE_URL = 'https://your-project-url.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key'
```

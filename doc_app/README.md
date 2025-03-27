# MediSchedule - Doctor Appointment Scheduler

MediSchedule is a web application that allows patients to search for doctors by specialty and location, and book appointments online. The application uses Supabase for backend services, including authentication and data storage.

## Features

- **User Authentication**: Register and login using email/password
- **Doctor Search**: Find doctors by specialty and location
- **Appointment Booking**: Book appointments with available doctors
- **Time Slot Selection**: View and select available time slots

## Tech Stack

- **Frontend**: HTML, JavaScript, Tailwind CSS
- **Backend**: Supabase (Authentication, Database)
- **Libraries**: 
  - RemixIcon for icons
  - Supabase JS Client for API interactions

## Project Setup

### Prerequisites

- Supabase account (free tier is sufficient)
- Web browser

### Installation

1. Clone the repository or download the files
2. Set up your Supabase project (see instructions in `supabase-setup.md`)
3. Update the Supabase configuration in `app.js`:
   ```javascript
   const SUPABASE_URL = 'your-project-url'
   const SUPABASE_ANON_KEY = 'your-anon-key'
   ```
4. Serve the files using a local server or deploy to a hosting provider

### Database Setup

Follow the detailed instructions in `supabase-setup.md` to:
1. Create required tables (doctors, locations, available_slots, appointments)
2. Set up authentication
3. Configure row-level security policies
4. Insert sample data

## Usage

1. **Search for Doctors**:
   - Enter a specialty (e.g., "cardiology", "pediatrics")
   - Filter by location
   - Click on "Select Doctor" to proceed to booking

2. **Book an Appointment**:
   - Select a doctor (or use the doctor selected from search)
   - Choose a date
   - Select an available time slot
   - Fill in your details
   - Submit the form

3. **Manage Appointments**:
   - Login to view your appointments
   - Update or cancel existing appointments

## Development

### Project Structure

- `index.html` - Main HTML file with page structure
- `app.js` - JavaScript code handling app functionality
- `supabase-setup.md` - Instructions for setting up Supabase

### Extending the Project

- **Add Patient Profiles**: Create a profile page for patients to manage their information
- **Appointment Reminders**: Implement email notifications for upcoming appointments
- **Doctor Reviews**: Add functionality for patients to leave reviews for doctors
- **Admin Dashboard**: Create an admin interface for managing doctors and appointments

## License

[MIT License](LICENSE)

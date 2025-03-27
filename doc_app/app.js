// Supabase Configuration
const SUPABASE_URL = 'https://your-project-url.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key'

// Fix client initialization
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Authentication Modal Management
const authModal = document.getElementById('authModal')
const loginBtn = document.getElementById('loginBtn')
const registerBtn = document.getElementById('registerBtn')
const authForm = document.getElementById('authForm')
const modalTitle = document.getElementById('modalTitle')
const switchAuthMode = document.getElementById('switchAuthMode')

let isLoginMode = true
let currentUser = null

// Close modal when clicking outside
authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.classList.add('hidden')
        authModal.classList.remove('flex')
    }
})

// Toggle between Login and Register
switchAuthMode.addEventListener('click', () => {
    isLoginMode = !isLoginMode
    modalTitle.textContent = isLoginMode ? 'Login' : 'Register'
    switchAuthMode.textContent = isLoginMode 
        ? 'Need an account? Register' 
        : 'Already have an account? Login'
})

// Show Authentication Modal
function showAuthModal() {
    authModal.classList.remove('hidden')
    authModal.classList.add('flex')
}

loginBtn.addEventListener('click', showAuthModal)
registerBtn.addEventListener('click', () => {
    isLoginMode = false
    modalTitle.textContent = 'Register'
    showAuthModal()
})

// Check if user is already logged in
async function checkSession() {
    const { data, error } = await supabase.auth.getSession()
    if (data.session) {
        currentUser = data.session.user
        updateUIForLoggedInUser()
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    if (currentUser) {
        loginBtn.innerHTML = '<i class="ri-user-line mr-1"></i> My Account'
        loginBtn.removeEventListener('click', showAuthModal)
        loginBtn.addEventListener('click', showUserDashboard)
        
        registerBtn.innerHTML = '<i class="ri-logout-box-line mr-1"></i> Logout'
        registerBtn.removeEventListener('click', showAuthModal)
        registerBtn.addEventListener('click', handleLogout)
        
        // Update user info in dashboard if elements exist
        const userEmail = document.getElementById('userEmail');
        if (userEmail) {
            userEmail.textContent = currentUser.email;
        }
        
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome back!`;
        }
    }
}

// Show user profile - Updated to display dashboard
function showUserProfile() {
    showUserDashboard();
}

// Show user dashboard
function showUserDashboard() {
    document.getElementById('mainContent').classList.add('hidden');
    document.getElementById('userDashboard').classList.remove('hidden');
    
    // Scroll to dashboard
    document.getElementById('userDashboard').scrollIntoView({ behavior: 'smooth' });
    
    loadUserAppointments();
    loadUserProfile();
}

// Return from dashboard to home
function backToHome() {
    document.getElementById('mainContent').classList.remove('hidden');
    document.getElementById('userDashboard').classList.add('hidden');
}

// Scroll to search section
function scrollToSearch() {
    document.getElementById('doctors').scrollIntoView({ behavior: 'smooth' });
}

// Handle logout
async function handleLogout() {
    await supabase.auth.signOut()
    currentUser = null
    
    // Reset UI
    loginBtn.innerHTML = '<i class="ri-login-circle-line mr-1"></i> Login'
    loginBtn.removeEventListener('click', showUserDashboard)
    loginBtn.addEventListener('click', showAuthModal)
    
    registerBtn.innerHTML = '<i class="ri-user-add-line mr-1"></i> Register'
    registerBtn.removeEventListener('click', handleLogout)
    registerBtn.addEventListener('click', () => {
        isLoginMode = false
        modalTitle.textContent = 'Register'
        showAuthModal()
    })
    
    // Return to home if on dashboard
    if (!document.getElementById('userDashboard').classList.contains('hidden')) {
        backToHome();
    }
    
    showToast('You have been logged out successfully');
}

// Toast notification system
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'fixed bottom-4 right-4 z-50';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `mb-3 px-4 py-2 rounded-lg shadow-lg text-white fade-in ${
        type === 'error' ? 'bg-red-600' : 
        type === 'success' ? 'bg-green-600' : 
        type === 'warning' ? 'bg-yellow-600' : 
        'bg-blue-600'
    }`;
    
    // Add icon based on type
    const icon = type === 'error' ? 'ri-error-warning-line' : 
                type === 'success' ? 'ri-check-line' : 
                type === 'warning' ? 'ri-alert-line' : 
                'ri-information-line';
                
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="${icon} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 500);
    }, 3000);
}

// Authentication Form Submission
authForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    // Get values from labeled inputs rather than general selectors
    const email = document.getElementById('authEmail')?.value || authForm.querySelector('input[type="email"]').value;
    const password = document.getElementById('authPassword')?.value || authForm.querySelector('input[type="password"]').value;
    
    // Show loading state on button
    const submitButton = authForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="animate-pulse">Processing...</span>';
    submitButton.disabled = true;

    try {
        if (isLoginMode) {
            // Login
            const { data, error } = await supabase.auth.signInWithPassword({
                email, password
            })
            if (error) throw error
            currentUser = data.user
            updateUIForLoggedInUser()
            showToast('Login Successful!', 'success');
        } else {
            // Register
            const { data, error } = await supabase.auth.signUp({
                email, password
            })
            if (error) throw error
            showToast('Registration Successful! Please check your email for verification.', 'success');
        }
        authModal.classList.add('hidden')
        authModal.classList.remove('flex')
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        // Restore button state
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
    }
})

// Doctor Search Functionality
const specialtySearch = document.getElementById('specialtySearch')
const locationFilter = document.getElementById('locationFilter')
const doctorResults = document.getElementById('doctorResults')

// Clear filters button functionality
const clearFiltersBtn = document.getElementById('clearFilters');
if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
        specialtySearch.value = '';
        locationFilter.value = '';
        searchDoctors();
    });
}

// Populate locations dropdown
async function populateLocations() {
    const { data, error } = await supabase
        .from('locations')
        .select('id, name')

    if (error) {
        console.error('Error fetching locations:', error)
        return
    }

    locationFilter.innerHTML = '<option value="">Select Location</option>' + 
        data.map(location => `<option value="${location.id}">${location.name}</option>`).join('')
}

async function searchDoctors() {
    // Show loading state
    doctorResults.innerHTML = `
        <div class="flex justify-center items-center h-32">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    `;
    
    const specialty = specialtySearch.value.toLowerCase()
    const locationId = locationFilter.value
    
    let query = supabase
        .from('doctors')
        .select('*, locations(*)')
    
    if (specialty) {
        query = query.ilike('specialty', `%${specialty}%`)
    }
    
    if (locationId) {
        query = query.eq('location_id', locationId)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error searching doctors:', error)
        showToast('Error loading doctors', 'error');
        doctorResults.innerHTML = '<p class="text-red-500">Error loading doctors. Please try again.</p>';
        return
    }

    // Small delay for smoother UI
    setTimeout(() => {
        if (data && data.length > 0) {
            doctorResults.innerHTML = data.map(doctor => `
                <div class="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 card-hover transition-all">
                    <div class="flex items-start">
                        <div class="bg-blue-100 rounded-full p-3 mr-4 flex-shrink-0">
                            <i class="ri-user-3-line text-blue-600 text-xl"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-semibold text-gray-800">${doctor.name}</h3>
                            <p class="text-blue-600 text-sm">${doctor.specialty}</p>
                            <div class="flex items-center text-gray-500 text-xs mt-1">
                                <i class="ri-map-pin-line mr-1"></i>
                                <span>${doctor.locations ? doctor.locations.name : 'Location not specified'}</span>
                            </div>
                            <div class="mt-3 flex justify-between items-center">
                                <button onclick="viewDoctorDetails('${doctor.id}')" class="text-sm text-blue-600 hover:text-blue-800">
                                    <i class="ri-information-line mr-1"></i> More Info
                                </button>
                                <button class="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700" 
                                    onclick="selectDoctor('${doctor.id}', '${doctor.name}')">
                                    <i class="ri-calendar-line mr-1"></i> Book Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')
        } else {
            doctorResults.innerHTML = `
                <div class="flex flex-col items-center justify-center h-32 text-center">
                    <i class="ri-search-line text-3xl text-gray-400 mb-2"></i>
                    <p class="text-gray-500">No doctors found matching your criteria</p>
                    <button onclick="clearFilters()" class="mt-2 text-sm text-blue-600 hover:text-blue-800">Clear filters and try again</button>
                </div>
            `
        }
    }, 300);
}

// View doctor details
function viewDoctorDetails(doctorId) {
    // Fetch the doctor's details
    supabase.from('doctors')
        .select('*, locations(*)')
        .eq('id', doctorId)
        .single()
        .then(({ data: doctor, error }) => {
            if (error) {
                showToast('Could not load doctor details', 'error');
                return;
            }
            
            // Create modal for doctor details
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.id = 'doctorDetailsModal';
            
            modal.innerHTML = `
                <div class="bg-white p-6 rounded-xl w-full max-w-lg m-4 fade-in">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-semibold">Doctor Details</h2>
                        <button class="text-gray-500 hover:text-gray-800" onclick="document.getElementById('doctorDetailsModal').remove()">
                            <i class="ri-close-line text-xl"></i>
                        </button>
                    </div>
                    <div class="flex flex-col md:flex-row">
                        <div class="md:w-1/3 mb-4 md:mb-0 flex justify-center">
                            <div class="bg-blue-100 rounded-full p-8">
                                <i class="ri-user-3-line text-blue-600 text-4xl"></i>
                            </div>
                        </div>
                        <div class="md:w-2/3 md:pl-6">
                            <h3 class="font-bold text-lg">${doctor.name}</h3>
                            <p class="text-blue-600">${doctor.specialty}</p>
                            <p class="text-sm text-gray-500 mt-1">
                                <i class="ri-map-pin-line"></i> ${doctor.locations ? doctor.locations.name : 'Location not specified'}
                            </p>
                            <div class="mt-4">
                                <h4 class="font-semibold text-gray-700">About</h4>
                                <p class="text-gray-600 mt-1">${doctor.bio || 'No biography available.'}</p>
                            </div>
                        </div>
                    </div>
                    <div class="mt-6 flex justify-end">
                        <button class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 mr-2" 
                            onclick="document.getElementById('doctorDetailsModal').remove()">
                            Close
                        </button>
                        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" 
                            onclick="selectDoctor('${doctor.id}', '${doctor.name}'); document.getElementById('doctorDetailsModal').remove()">
                            Book Appointment
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        });
}

// Function to clear filters
function clearFilters() {
    if (specialtySearch) specialtySearch.value = '';
    if (locationFilter) locationFilter.value = '';
    searchDoctors();
}

// Function to select doctor from search results
function selectDoctor(id, name) {
    doctorSelect.value = id;
    
    // Scroll to appointment section
    document.getElementById('appointmentForm').scrollIntoView({ behavior: 'smooth' });
    
    // Trigger available slots fetch
    fetchAvailableSlots();
}

specialtySearch.addEventListener('input', searchDoctors)
locationFilter.addEventListener('change', searchDoctors)

// Appointment Booking
const appointmentForm = document.getElementById('appointmentForm')
const doctorSelect = document.getElementById('doctorSelect')
const appointmentDate = document.getElementById('appointmentDate')
const timeSlot = document.getElementById('timeSlot')

// Set minimum date to today
const today = new Date().toISOString().split('T')[0]
appointmentDate.min = today

// Populate Doctor Dropdown
async function populateDoctors() {
    const { data, error } = await supabase
        .from('doctors')
        .select('id, name, specialty')
    
    if (error) {
        console.error('Error fetching doctors:', error)
        return
    }

    doctorSelect.innerHTML = '<option value="">Select Doctor</option>' + 
        data.map(doctor => 
            `<option value="${doctor.id}">${doctor.name} - ${doctor.specialty}</option>`
        ).join('')
}

// Fetch Available Time Slots
async function fetchAvailableSlots() {
    const selectedDoctor = doctorSelect.value
    const selectedDate = appointmentDate.value
    
    if (!selectedDoctor || !selectedDate) {
        timeSlot.innerHTML = '<option value="">Select Time Slot</option>'
        return
    }

    const { data, error } = await supabase
        .from('available_slots')
        .select('*')
        .eq('doctor_id', selectedDoctor)
        .eq('date', selectedDate)
        .eq('is_booked', false)

    if (error) {
        console.error('Error fetching slots:', error)
        return
    }

    timeSlot.innerHTML = data.length > 0 ? 
        '<option value="">Select Time Slot</option>' + 
        data.map(slot => 
            `<option value="${slot.id}">${slot.start_time} - ${slot.end_time}</option>`
        ).join('') :
        '<option value="">No available slots</option>'
}

// Book Appointment
async function bookAppointment(e) {
    e.preventDefault()
    
    if (!currentUser) {
        showToast('Please login to book an appointment', 'warning');
        showAuthModal();
        return;
    }
    
    // Get fields from form
    const form = e.target;
    const fullName = form.querySelector('[name="full_name"]').value;
    const email = form.querySelector('[name="email"]').value;
    const selectedSlotId = form.querySelector('[name="slot_id"]').value;
    const notes = form.querySelector('[name="notes"]')?.value || '';
    
    if (!selectedSlotId) {
        showToast('Please select a valid time slot', 'warning');
        return;
    }
    
    // Disable submit button during processing
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="animate-pulse">Processing...</span>';
    submitButton.disabled = true;
    
    const appointmentData = {
        doctor_id: form.querySelector('[name="doctor_id"]').value,
        patient_name: fullName,
        email: email,
        slot_id: selectedSlotId,
        user_id: currentUser.id,
        notes: notes,
        status: 'pending',
        created_at: new Date().toISOString()
    }

    // Begin transaction
    try {
        // 1. Create appointment
        const { data: appointment, error: appointmentError } = await supabase
            .from('appointments')
            .insert(appointmentData)
            .select();

        if (appointmentError) throw appointmentError;

        // 2. Mark slot as booked
        const { error: slotError } = await supabase
            .from('available_slots')
            .update({ is_booked: true })
            .eq('id', selectedSlotId);

        if (slotError) throw slotError;

        showToast('Appointment booked successfully!', 'success');
        form.reset();
        timeSlot.innerHTML = '<option value="">Select Time Slot</option>';
        
        // Show booking confirmation
        showBookingConfirmation(appointment[0]);
    } catch (error) {
        console.error('Booking failed:', error);
        showToast(`Appointment booking failed: ${error.message}`, 'error');
    } finally {
        // Restore button state
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
    }
}

// Show booking confirmation
function showBookingConfirmation(appointment) {
    // Fetch more details about the appointment
    supabase
        .from('appointments')
        .select('*, doctors(name, specialty), available_slots(date, start_time, end_time)')
        .eq('id', appointment.id)
        .single()
        .then(({ data, error }) => {
            if (error) {
                console.error('Error fetching appointment details:', error);
                return;
            }
            
            // Create confirmation modal
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.id = 'bookingConfirmationModal';
            
            modal.innerHTML = `
                <div class="bg-white p-6 rounded-xl w-full max-w-md m-4 fade-in">
                    <div class="text-center mb-6">
                        <div class="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mx-auto">
                            <i class="ri-check-line text-3xl"></i>
                        </div>
                        <h2 class="text-xl font-bold mt-4">Appointment Confirmed!</h2>
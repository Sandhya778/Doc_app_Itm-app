/**
 * This utility script helps to generate sample data for your Supabase database.
 * You can copy and paste these samples into the SQL editor in your Supabase dashboard.
 */

// List of medical specialties
const specialties = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Family Medicine',
  'Gastroenterology',
  'Hematology',
  'Immunology',
  'Neurology',
  'Obstetrics',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Rheumatology',
  'Urology'
];

// Generate doctors SQL
function generateDoctorsSql(count = 20) {
  let sql = `-- Insert sample doctors\n`;
  
  for (let i = 1; i <= count; i++) {
    const specialty = specialties[Math.floor(Math.random() * specialties.length)];
    const locationId = Math.floor(Math.random() * 3) + 1; // Assuming we have 3 locations
    
    sql += `INSERT INTO doctors (name, specialty, location_id, bio) VALUES
  ('Dr. ${getRandomName()}', '${specialty}', (SELECT id FROM locations LIMIT 1 OFFSET ${locationId - 1}), '${getBioForSpecialty(specialty)}');\n`;
  }
  
  return sql;
}

// Helper functions
function getRandomName() {
  const firstNames = ['John', 'Jane', 'Michael', 'Emma', 'William', 'Olivia', 'James', 'Sophia', 'Robert', 'Ava', 'David', 'Isabella', 'Joseph', 'Mia', 'Thomas', 'Charlotte'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Lee'];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function getBioForSpecialty(specialty) {
  const bios = {
    'Cardiology': 'Specializes in diagnosing and treating conditions of the heart and cardiovascular system.',
    'Dermatology': 'Expert in conditions affecting the skin, hair, and nails.',
    'Endocrinology': 'Focuses on disorders of the endocrine system and hormone-related conditions.',
    'Family Medicine': 'Provides comprehensive healthcare for people of all ages.',
    'Gastroenterology': 'Specializes in digestive system disorders and liver disease.',
    'Hematology': 'Expert in blood disorders and diseases.',
    'Immunology': 'Focuses on disorders of the immune system.',
    'Neurology': 'Specializes in nervous system disorders, including the brain and spinal cord.',
    'Obstetrics': 'Specializes in pregnancy, childbirth, and postpartum care.',
    'Oncology': 'Focuses on the diagnosis and treatment of cancer.',
    'Ophthalmology': 'Specializes in eye and vision care.',
    'Orthopedics': 'Expert in musculoskeletal system - bones, joints, ligaments, tendons, and muscles.',
    'Pediatrics': 'Provides medical care for infants, children, and adolescents.',
    'Psychiatry': 'Specializes in mental health disorders and treatment.',
    'Pulmonology': 'Focuses on respiratory system diseases and conditions.',
    'Radiology': 'Specializes in using medical imaging for diagnosis and treatment.',
    'Rheumatology': 'Expert in autoimmune diseases and joint disorders.',
    'Urology': 'Focuses on urinary tract and male reproductive system disorders.'
  };
  
  return bios[specialty] || `Experienced ${specialty.toLowerCase()} specialist with years of clinical practice.`;
}

console.log(generateDoctorsSql(10));

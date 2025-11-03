
// Initialize Supabase
const supabase = supabase.createClient(
  'https://your-project-url.supabase.co',
  'your-anon-public-key'
);

// 🔐 AUTHENTICATION

// Sign Up
async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    alert('Sign up failed: ' + error.message);
  } else {
    alert('Account created! Redirecting to dashboard...');
    window.location.href = 'dashboard.html';
  }
}

// Sign In
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert('Login failed: ' + error.message);
  } else {
    alert('Welcome back!');
    window.location.href = 'dashboard.html';
  }
}

// Logout
async function logout() {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
}

// 🧠 SESSION CHECK
async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
  }
}

// 📚 BOOKS

// Add a book
async function addBook(title, author) {
  const { data, error } = await supabase
    .from('books')
    .insert([{ title, author }]);
  if (error) {
    console.error('Error adding book:', error.message);
  } else {
    console.log('Book added:', data);
  }
}

// Fetch books
async function fetchBooks() {
  const { data, error } = await supabase
    .from('books')
    .select('*');
  if (error) {
    console.error('Error fetching books:', error.message);
  } else {
    console.table(data);
  }
}

// 🔔 ALARMS

// Add alarm
async function addAlarm(time, user_id) {
  const { data, error } = await supabase
    .from('alarms')
    .insert([{ time, user_id, active: true }]);
  if (error) {
    console.error('Error adding alarm:', error.message);
  } else {
    console.log('Alarm added:', data);
  }
}

// Fetch alarms
async function fetchAlarms() {
  const { data, error } = await supabase
    .from('alarms')
    .select('*');
  if (error) {
    console.error('Error fetching alarms:', error.message);
  } else {
    console.table(data);
  }
}

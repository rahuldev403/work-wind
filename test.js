// Registration Flow
const signup = async () => {
  // Step 1: Submit registration
  const res1 = await fetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
  // User receives OTP in email
  
  // Step 2: Verify OTP
  const res2 = await fetch('/api/auth/verify-registration', {
    method: 'POST',
    body: JSON.stringify({ email, otp })
  });
  // User is now logged in
};

// Login Flow
const login = async () => {
  // Step 1: Submit credentials
  const res1 = await fetch('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  // User receives OTP in email
  
  // Step 2: Verify OTP
  const res2 = await fetch('/api/auth/verify-login', {
    method: 'POST',
    body: JSON.stringify({ email, otp })
  });
  // User is now logged in
};

// Forgot Password Flow
const resetPassword = async () => {
  // Step 1: Request reset
  const res1 = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
  // User receives OTP in email
  
  // Step 2: Reset password with OTP
  const res2 = await fetch('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, otp, newPassword })
  });
  // Password is now reset
};
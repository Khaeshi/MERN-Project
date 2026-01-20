import fetch from 'node-fetch';

const registerUser = async () => {
  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log('Status:', response.status);
    console.log('Headers:', response.headers.get('content-type'));

    const text = await response.text(); // Get as text first
    console.log('Response Text:', text);

    if (response.ok) {
      const data = JSON.parse(text);
      console.log('User registered successfully:', data);
    } else {
      console.error('Registration failed:', text);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

registerUser();
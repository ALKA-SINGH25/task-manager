const axios = require('axios');
(async () => {
  try {
    const resLogin = await axios.post('http://localhost:8000/auth/login', {
      email: 'test3@example.com',
      password: 'password'
    });
    const token = resLogin.data.access_token;
    console.log('Token:', token);
    
    const payload = {
      title: 'New Task',
      description: null,
      status: 'todo',
      end_date: null
    };
    
    const res = await axios.post('http://localhost:8000/tasks', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Success:', res.data);
  } catch (e) {
    console.log('Error:', e.response ? e.response.data : e.message);
  }
})();

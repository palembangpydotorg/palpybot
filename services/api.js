require('dotenv').config();
const API_URL = process.env.API_URL;

const userMap = new Map();
let accessToken = null;

async function login(username, password) {
  const body = new URLSearchParams();
  body.append('username', username);
  body.append('password', password);

  try {
    const res = await fetch(`${API_URL}/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    if (!res.ok) {
      throw new Error(`Status: ${res.status}`);
    }

    const data = await res.json();
    if (data.access_token) {
      accessToken = data.access_token;
    }
    return data;
  } catch (e) {
    console.log('Login error:', e.message);
    return null;
  }
}

async function registerUser(data) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${API_URL}/v1/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: data.name,
        username: data.username,
        telegram_id: data.telegram_id,
        avatar_url: data.avatar_url
      })
    });
    const result = await res.json();
    
    if (result.telegram_id && result.id) {
      userMap.set(String(result.telegram_id), result.id);
    }
    return result;
  } catch (e) {
    return { sukses: false, pesan: 'Gagal terhubung ke server' };
  }
}

async function checkRegistered(telegramId) {
  try {
    const id = String(telegramId);
    const headers = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${API_URL}/v1/users/telegram/${encodeURIComponent(id)}`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.id) {
        userMap.set(id, data.id);
      }
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

async function addPoints(telegramId, addAmount = 1) {
  try {
    const id = String(telegramId);
    let userId = userMap.get(id);
    
    if (!userId) {
      const data = await checkRegistered(id);
      if (!data || !data.id) return null;
      userId = data.id;
    }

    const headers = { 'Content-Type': 'application/json' };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${API_URL}/v1/users/${userId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ points: addAmount })
    });
    return await res.json();
  } catch (e) {
    console.log('Gagal menambah poin:', e.message);
    return null;
  }
}

module.exports = {
  login,
  registerUser,
  checkRegistered,
  addPoints
};

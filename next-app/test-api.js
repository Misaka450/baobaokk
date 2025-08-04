// test-api.js
// 这个脚本用于测试Cloudflare Worker后端API的连接

// 请替换为您的Cloudflare Worker URL
const API_URL = 'https://your-worker-url.workers.dev';
let authToken = null;

// 测试登录功能
async function testLogin() {
  console.log('测试登录功能...');
  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'password123'
      })
    });

    const data = await response.json();
    console.log('登录响应:', data);

    if (response.ok) {
      authToken = data.token;
      console.log('登录成功！获取到的token:', authToken);
      return true;
    } else {
      console.error('登录失败:', data.message);
      return false;
    }
  } catch (error) {
    console.error('登录请求发生错误:', error);
    return false;
  }
}

// 测试获取时间轴数据
async function testGetTimeline() {
  console.log('测试获取时间轴数据...');
  try {
    const response = await fetch(`${API_URL}/api/timeline`);
    const data = await response.json();
    console.log('时间轴数据:', data);
    return true;
  } catch (error) {
    console.error('获取时间轴数据发生错误:', error);
    return false;
  }
}

// 测试获取相册数据
async function testGetAlbums() {
  console.log('测试获取相册数据...');
  try {
    const response = await fetch(`${API_URL}/api/albums`);
    const data = await response.json();
    console.log('相册数据:', data);
    return true;
  } catch (error) {
    console.error('获取相册数据发生错误:', error);
    return false;
  }
}

// 测试添加时间轴项
async function testAddTimeline() {
  if (!authToken) {
    console.error('请先登录');
    return false;
  }

  console.log('测试添加时间轴项...');
  try {
    const response = await fetch(`${API_URL}/api/timeline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        date: '2023-12-25',
        title: '测试时间轴项',
        description: '这是一个测试用的时间轴项',
        image: 'https://example.com/test-image.jpg'
      })
    });

    const data = await response.json();
    console.log('添加时间轴项响应:', data);

    if (response.ok) {
      console.log('时间轴项添加成功！');
      return true;
    } else {
      console.error('时间轴项添加失败:', data.message);
      return false;
    }
  } catch (error) {
    console.error('添加时间轴项发生错误:', error);
    return false;
  }
}

// 测试添加相册
async function testAddAlbum() {
  if (!authToken) {
    console.error('请先登录');
    return false;
  }

  console.log('测试添加相册...');
  try {
    const response = await fetch(`${API_URL}/api/albums`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title: '测试相册',
        description: '这是一个测试用的相册',
        coverImage: 'https://example.com/test-album.jpg',
        photoCount: 5
      })
    });

    const data = await response.json();
    console.log('添加相册响应:', data);

    if (response.ok) {
      console.log('相册添加成功！');
      return true;
    } else {
      console.error('相册添加失败:', data.message);
      return false;
    }
  } catch (error) {
    console.error('添加相册发生错误:', error);
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('开始运行所有测试...');
  const loginSuccess = await testLogin();
  if (loginSuccess) {
    await testGetTimeline();
    await testGetAlbums();
    await testAddTimeline();
    await testAddAlbum();
    console.log('所有测试运行完成！');
  } else {
    console.error('登录失败，无法继续其他测试');
  }
}

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
  // 添加到全局window对象，以便在控制台中调用
  window.testAPI = {
    runAllTests,
    testLogin,
    testGetTimeline,
    testGetAlbums,
    testAddTimeline,
    testAddAlbum
  };
  console.log('测试API已加载到window.testAPI');
  console.log('可以在控制台中运行 window.testAPI.runAllTests() 来执行所有测试');
}

// 如果在Node.js环境中运行
if (typeof module !== 'undefined') {
  module.exports = {
    runAllTests,
    testLogin,
    testGetTimeline,
    testGetAlbums,
    testAddTimeline,
    testAddAlbum
  };
}
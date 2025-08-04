// Cloudflare Worker 后端代码
// 用于处理API请求和数据存储

// 模拟数据存储
let timelineItems = [
  { id: 1, date: '2023-10-08', title: '我们的第一天', description: '第一次相遇的日子', image: 'https://picsum.photos/600/400?random=1' },
  { id: 2, date: '2023-10-15', title: '第一次约会', description: '一起看电影和吃饭', image: 'https://picsum.photos/600/400?random=2' },
  { id: 3, date: '2023-11-08', title: '确定关系', description: '正式成为情侣', image: 'https://picsum.photos/600/400?random=3' }
];

let albumItems = [
  { id: 1, title: '旅行回忆', description: '我们一起去过的地方', coverImage: 'https://picsum.photos/600/400?random=4', photoCount: 24 },
  { id: 2, title: '美食日记', description: '一起品尝的美食', coverImage: 'https://picsum.photos/600/400?random=5', photoCount: 18 },
  { id: 3, title: '纪念日', description: '特殊的日子', coverImage: 'https://picsum.photos/600/400?random=6', photoCount: 12 }
];

// 管理员账户 (实际应用中应使用环境变量存储)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123'; // 实际应用中应使用加密存储

// 处理请求的主函数
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // 解析请求URL
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // 设置CORS头部
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // 处理OPTIONS请求
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 验证管理员身份的中间件
  async function authenticate() {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return false;

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) return false;

    // 简单验证token (实际应用中应使用JWT库)
    return token === 'admin_token'; // 简化版，实际应使用加密验证
  }

  // API路由处理
  // 登录路由
  if (path === '/api/login' && method === 'POST') {
    const { username, password } = await request.json();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // 生成令牌 (实际应用中应使用JWT库)
      return new Response(JSON.stringify({
        success: true,
        token: 'admin_token'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: '用户名或密码错误'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // 时间轴API
  if (path === '/api/timeline' && method === 'GET') {
    return new Response(JSON.stringify(timelineItems), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // 添加时间轴项
  if (path === '/api/timeline' && method === 'POST') {
    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      return new Response(JSON.stringify({
        success: false,
        message: '未授权访问'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const newItem = await request.json();
    newItem.id = timelineItems.length + 1;
    timelineItems.push(newItem);

    return new Response(JSON.stringify({
      success: true,
      item: newItem
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // 更新时间轴项
  if (path.startsWith('/api/timeline/') && method === 'PUT') {
    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      return new Response(JSON.stringify({
        success: false,
        message: '未授权访问'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const id = parseInt(path.split('/')[3]);
    const updatedItem = await request.json();
    const index = timelineItems.findIndex(item => item.id === id);

    if (index !== -1) {
      timelineItems[index] = { ...timelineItems[index], ...updatedItem };
      return new Response(JSON.stringify({
        success: true,
        item: timelineItems[index]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: '未找到该时间轴项'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // 删除时间轴项
  if (path.startsWith('/api/timeline/') && method === 'DELETE') {
    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      return new Response(JSON.stringify({
        success: false,
        message: '未授权访问'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const id = parseInt(path.split('/')[3]);
    const initialLength = timelineItems.length;
    timelineItems = timelineItems.filter(item => item.id !== id);

    if (timelineItems.length < initialLength) {
      return new Response(JSON.stringify({
        success: true,
        message: '时间轴项已删除'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: '未找到该时间轴项'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // 相册API
  if (path === '/api/albums' && method === 'GET') {
    return new Response(JSON.stringify(albumItems), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // 添加相册
  if (path === '/api/albums' && method === 'POST') {
    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      return new Response(JSON.stringify({
        success: false,
        message: '未授权访问'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const newAlbum = await request.json();
    newAlbum.id = albumItems.length + 1;
    albumItems.push(newAlbum);

    return new Response(JSON.stringify({
      success: true,
      album: newAlbum
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // 更新相册
  if (path.startsWith('/api/albums/') && method === 'PUT') {
    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      return new Response(JSON.stringify({
        success: false,
        message: '未授权访问'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const id = parseInt(path.split('/')[3]);
    const updatedAlbum = await request.json();
    const index = albumItems.findIndex(album => album.id === id);

    if (index !== -1) {
      albumItems[index] = { ...albumItems[index], ...updatedAlbum };
      return new Response(JSON.stringify({
        success: true,
        album: albumItems[index]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: '未找到该相册'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // 删除相册
  if (path.startsWith('/api/albums/') && method === 'DELETE') {
    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      return new Response(JSON.stringify({
        success: false,
        message: '未授权访问'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const id = parseInt(path.split('/')[3]);
    const initialLength = albumItems.length;
    albumItems = albumItems.filter(album => album.id !== id);

    if (albumItems.length < initialLength) {
      return new Response(JSON.stringify({
        success: true,
        message: '相册已删除'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: '未找到该相册'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // 处理其他路由
  return new Response('Not Found', {
    status: 404,
    headers: corsHeaders
  });
}
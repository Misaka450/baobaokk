// Cloudflare Worker 后端代码
// 用于处理API请求和数据存储

// Cloudflare R2 配置
const R2_BUCKET_NAME = 'baobaokk-photos'; // 替换为你的R2存储桶名称

/**
 * 获取R2存储桶实例
 * @returns {R2Bucket|null} R2存储桶实例，如果在非Cloudflare环境中则返回null
 */

// 模拟数据存储
let timelineItems = [
  {
    id: 1,
    title: '宝宝出生',
    date: '2023-01-15',
    description: '我们的宝宝出生了！',
    imageUrl: 'https://picsum.photos/600/400?random=1'
  }
];

let albumItems = [
  {
    id: 1,
    title: '满月照',
    description: '宝宝满月纪念',
    coverUrl: 'https://picsum.photos/600/400?random=2',
    photoCount: 5,
    createdAt: '2023-02-15'
  }
];

// 存储照片数据
let photoItems = [
  {
    id: 1,
    albumId: 1,
    url: 'https://picsum.photos/600/400?random=3',
    description: '宝宝在睡觉'
  },
  {
    id: 2,
    albumId: 1,
    url: 'https://picsum.photos/600/400?random=4',
    description: '宝宝在洗澡'
  }
];
  // 相册1的照片
  { id: 1, albumId: 1, url: 'https://picsum.photos/600/400?random=101', description: '旅行照片1' },
  { id: 2, albumId: 1, url: 'https://picsum.photos/600/400?random=102', description: '旅行照片2' },
  // 相册2的照片
  { id: 3, albumId: 2, url: 'https://picsum.photos/600/400?random=201', description: '美食照片1' },
  { id: 4, albumId: 2, url: 'https://picsum.photos/600/400?random=202', description: '美食照片2' },
  // 相册3的照片
  { id: 5, albumId: 3, url: 'https://picsum.photos/600/400?random=301', description: '纪念日照片1' },
  { id: 6, albumId: 3, url: 'https://picsum.photos/600/400?random=302', description: '纪念日照片2' }
];

// 管理员账户 (实际应用中应使用环境变量存储)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123'; // 实际应用中应使用加密存储

// 获取R2存储桶
function getR2Bucket() {
  // 在Cloudflare Worker环境中
  if (typeof env !== 'undefined' && env[R2_BUCKET_NAME]) {
    return env[R2_BUCKET_NAME];
  }
  // 本地开发环境返回null
  return null;
}

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

  // 文件上传API
  if (path === '/api/upload' && method === 'POST') {
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

    try {
      // 解析表单数据
      const formData = await request.formData();
      const file = formData.get('file');
      const albumId = formData.get('albumId');
      const description = formData.get('description') || '';

      if (!file || !albumId) {
        return new Response(JSON.stringify({
          success: false,
          message: '缺少文件或相册ID'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 检查文件类型
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        return new Response(JSON.stringify({
          success: false,
          message: '不支持的文件类型，仅支持JPG、PNG和WEBP'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 检查文件大小（最大2MB）
      if (file.size > 2 * 1024 * 1024) {
        return new Response(JSON.stringify({
          success: false,
          message: '文件大小超过2MB限制'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 生成唯一文件名
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 10);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `${timestamp}-${randomString}.${fileExtension}`;

      let fileUrl;
      const r2Bucket = getR2Bucket();

      if (r2Bucket) {
        // 上传到Cloudflare R2
        await r2Bucket.put(fileName, file.stream(), {
          httpMetadata: { contentType: file.type },
          customMetadata: { albumId, description }
        });

        // 生成文件URL (假设已配置自定义域)
        // 实际应用中，应根据你的R2配置生成正确的URL
        fileUrl = `https://${R2_BUCKET_NAME}.r2.cloudflarestorage.com/${fileName}`;
      } else {
        // 本地开发环境，使用picsum.photos模拟
        const randomId = Math.floor(Math.random() * 1000);
        fileUrl = `https://picsum.photos/600/400?random=${randomId}`;
      }

      // 保存照片信息
      const newPhotoId = photoItems.length + 1;
      const newPhoto = {
        id: newPhotoId,
        albumId: parseInt(albumId),
        url: fileUrl,
        description
      };
      photoItems.push(newPhoto);

      // 更新相册照片数量
      const albumIndex = albumItems.findIndex(album => album.id === parseInt(albumId));
      if (albumIndex !== -1) {
        albumItems[albumIndex].photoCount += 1;
      }

      return new Response(JSON.stringify({
        success: true,
        url: fileUrl,
        photo: newPhoto
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('文件上传错误:', error);
      return new Response(JSON.stringify({
        success: false,
        message: '文件上传失败'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // 获取相册照片API
  if (path.startsWith('/api/albums/') && path.endsWith('/photos') && method === 'GET') {
    const albumId = parseInt(path.split('/')[3]);
    const albumPhotos = photoItems.filter(photo => photo.albumId === albumId);

    return new Response(JSON.stringify(albumPhotos), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // 处理其他路由
  return new Response('Not Found', {
    status: 404,
    headers: corsHeaders
  });
}
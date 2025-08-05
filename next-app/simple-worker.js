// 简化版 Cloudflare Worker 后端代码

// 模拟数据存储
let timelineItems = [
  {
    id: 1,
    title: '宝宝出生',
    date: '2023-01-15',
    description: '我们的宝宝出生了！',
    imageUrl: 'https://picsum.photos/600/400?random=1'
  },
  {
    id: 2,
    title: '第一次微笑',
    date: '2023-02-20',
    description: '宝宝第一次微笑了！',
    imageUrl: 'https://picsum.photos/600/400?random=2'
  },
  {
    id: 3,
    title: '满月纪念',
    date: '2023-02-15',
    description: '宝宝满月了！',
    imageUrl: 'https://picsum.photos/600/400?random=3'
  },
  {
    id: 4,
    title: '第一次翻身',
    date: '2023-03-10',
    description: '宝宝第一次翻身了！',
    imageUrl: 'https://picsum.photos/600/400?random=4'
  },
  {
    id: 5,
    title: '百日宴',
    date: '2023-04-23',
    description: '宝宝百日宴！',
    imageUrl: 'https://picsum.photos/600/400?random=5'
  }
];

// 设置CORS头部
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 处理请求的主函数
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // 解析请求URL
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // 静态文件处理
  // 尝试将请求路径映射到next-app目录下的文件
  let staticFilePath = path === '/' ? '/index.html' : path;
  staticFilePath = `/next-app${staticFilePath}`;

  // 支持的静态文件类型
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
  };

  // 获取文件扩展名
  const extension = staticFilePath.split('.').pop().toLowerCase();
  const mimeType = mimeTypes[`.${extension}`] || 'application/octet-stream';

  // 处理OPTIONS请求
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 优先处理API路由
  // 时间轴API
  if (path === '/api/timeline' && method === 'GET') {
    return new Response(JSON.stringify(timelineItems), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  // API文档
  if (path === '/api/docs' && method === 'GET') {
    const docs = {
      endpoints: [
        {
          path: '/api/timeline',
          method: 'GET',
          description: '获取宝宝成长时间轴数据'
        }
      ],
      example: 'GET /api/timeline 返回示例:\n' + JSON.stringify(timelineItems[0], null, 2)
    };
    return new Response(JSON.stringify(docs, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  // 然后处理静态文件请求
  // 检查请求是否匹配已知的静态文件
  const knownStaticFiles = {
    '/': '/next-app/index.html',
    '/index.html': '/next-app/index.html',
    '/admin-dashboard.html': '/next-app/admin-dashboard.html',
    '/admin-login.html': '/next-app/admin-login.html',
    '/album-detail.html': '/next-app/album-detail.html',
    '/stats-counter.js': '/next-app/stats-counter.js',
    '/test-api.js': '/next-app/test-api.js',
    '/test-upload.js': '/next-app/test-upload.js'
  };

  // 如果是已知的静态文件，返回对应的文件
  if (knownStaticFiles[path]) {
    // 在实际部署中，这里应该从Cloudflare KV或资产绑定中获取文件
    // 这里简单返回文件路径信息，提示用户需要正确配置静态资产
    return new Response(`请在Cloudflare Worker中配置静态资产绑定，以访问: ${knownStaticFiles[path]}`, {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }

  // 时间轴API
  if (path === '/api/timeline' && method === 'GET') {
    return new Response(JSON.stringify(timelineItems), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  // 处理根路径请求
  if (path === '/') {
    return new Response('Welcome to BabyKK Timeline API!\n\n可用接口:\n- GET /api/timeline - 获取时间轴数据', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }

  // 为前端应用提供API文档说明
  if (path === '/api/docs') {
    const docs = {
      endpoints: [
        {
          path: '/api/timeline',
          method: 'GET',
          description: '获取宝宝成长时间轴数据'
        }
      ],
      example: 'GET /api/timeline 返回示例:\n' + JSON.stringify(timelineItems[0], null, 2)
    };
    return new Response(JSON.stringify(docs, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}
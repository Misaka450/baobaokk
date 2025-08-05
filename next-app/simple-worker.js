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

  // 处理OPTIONS请求
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 时间轴API
  if (path === '/api/timeline' && method === 'GET') {
    return new Response(JSON.stringify(timelineItems), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // 处理其他路由
  return new Response('Not Found', {
    status: 404,
    headers: corsHeaders
  });
}
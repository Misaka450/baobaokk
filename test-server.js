// 简单的Node.js服务器，用于本地开发环境
const http = require('http');
const fs = require('fs');

// 简化的路径处理函数
function joinPath(...parts) {
  return parts.join('\\').replace(/\//g, '\\');
}

// 模拟数据
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

// 创建服务器
const server = http.createServer((req, res) => {
  // 设置CORS头部
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method;

  // 仪表盘API
  if (path === '/api/dashboard' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      timelineCount: timelineItems.length,
      albumCount: albumItems.length,
      photoCount: photoItems.length,
      visitCount: 0
    }));
    return;
  }

  // 时间轴API - 获取所有项目
  if (path === '/api/timeline' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(timelineItems));
    return;
  }

  // 时间轴API - 添加新项目
  if (path === '/api/timeline' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const newItem = JSON.parse(body);
        newItem.id = timelineItems.length + 1;
        timelineItems.push(newItem);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, item: newItem }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid data' }));
      }
    });
    return;
  }

  // 时间轴API - 更新项目
  if (path.startsWith('/api/timeline/') && method === 'PUT') {
    const id = parseInt(path.split('/')[3]);
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const updatedItem = JSON.parse(body);
        const index = timelineItems.findIndex(item => item.id === id);
        if (index !== -1) {
          timelineItems[index] = { ...timelineItems[index], ...updatedItem };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, item: timelineItems[index] }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Item not found' }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid data' }));
      }
    });
    return;
  }

  // 时间轴API - 删除项目
  if (path.startsWith('/api/timeline/') && method === 'DELETE') {
    const id = parseInt(path.split('/')[3]);
    const initialLength = timelineItems.length;
    timelineItems = timelineItems.filter(item => item.id !== id);
    if (timelineItems.length < initialLength) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Item deleted' }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Item not found' }));
    }
    return;
  }

  // 相册API - 获取所有相册
  if (path === '/api/albums' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(albumItems));
    return;
  }

  // 相册API - 获取单个相册
  if (path.startsWith('/api/albums/') && method === 'GET') {
    const id = parseInt(path.split('/')[3]);
    const album = albumItems.find(item => item.id === id);
    if (album) {
      // 查找该相册的所有照片
      const albumPhotos = photoItems.filter(item => item.albumId === id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ...album, photos: albumPhotos }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Album not found' }));
    }
    return;
  }

  // 提供静态文件
  const filePath = path === '/' ? 'next-app/index.html' : path.substring(1);
  const fullPath = joinPath(__dirname, filePath);

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }

    // 设置正确的MIME类型
    let contentType = 'text/html';
    if (filePath.endsWith('.js')) contentType = 'application/javascript';
    else if (filePath.endsWith('.css')) contentType = 'text/css';
    else if (filePath.endsWith('.json')) contentType = 'application/json';
    else if (filePath.endsWith('.png')) contentType = 'image/png';
    else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

// 启动服务器
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
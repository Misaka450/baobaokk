# Cloudflare 部署指南

## 前提条件
- 拥有Cloudflare账户
- 已创建Cloudflare R2存储桶
- 已安装Node.js和npm

## 部署步骤

### 1. 配置R2存储桶
1. 登录Cloudflare控制台
2. 导航到R2部分
3. 创建新存储桶，命名为 `baobaokk-photos` (或修改worker.js中的`R2_BUCKET_NAME`常量)
4. 在存储桶设置中启用公开访问
5. 配置自定义域(可选)，用于访问存储的照片

### 2. 准备Cloudflare Worker
1. 安装Cloudflare CLI工具(Wrangler):
   ```
   npm install -g wrangler
   ```

2. 登录Wrangler:
   ```
   wrangler login
   ```

3. 初始化Worker项目:
   ```
   wrangler init baobaokk-photos
   ```

4. 将worker.js的内容复制到生成的index.js文件中

5. 更新wrangler.toml配置文件:
   ```toml
   name = "baobaokk-photos"
   main = "index.js"
   compatibility_date = "2023-10-08"

   # 配置R2存储桶
   [r2_buckets]
   binding = "MY_BUCKET"
   bucket_name = "baobaokk-photos"
   ```

### 3. 部署前端文件
1. 将next-app目录下的所有文件上传到Cloudflare Pages或其他静态托管服务
2. 或者，使用Cloudflare Workers Sites部署静态文件

### 4. 部署Worker
1. 部署Worker到Cloudflare:
   ```
   wrangler deploy
   ```

2. 记录Worker的URL，用于更新前端代码中的API_URL常量

### 5. 更新前端配置
1. 在admin-dashboard.html和test-api.js中，将API_URL常量更新为Worker的URL
   ```javascript
   const API_URL = 'https://your-worker-url.workers.dev/api';
   ```

## 本地开发测试
1. 启动本地服务器:
   ```
   npx http-server . -p 8080
   ```

2. 运行测试上传脚本:
   ```
   node test-upload.js
   ```

3. 在浏览器中访问 http://localhost:8080/admin-dashboard.html 测试上传功能

## 注意事项
- 本地开发环境中，文件不会真正上传到R2，而是使用picsum.photos模拟
- 部署到Cloudflare后，文件将实际存储到R2存储桶
- 确保在生产环境中使用HTTPS
- 考虑添加用户认证和授权的额外安全措施
- 定期备份R2存储桶中的数据
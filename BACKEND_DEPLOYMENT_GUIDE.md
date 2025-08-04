# Cloudflare Worker 后端部署指南

本指南将帮助您部署网站的后端服务到Cloudflare Worker。

## 前提条件
1. 拥有Cloudflare账户
2. 安装[Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

## 步骤1: 配置wrangler.toml

1. 打开`wrangler.toml`文件
2. 替换`YOUR_ACCOUNT_ID`为您的Cloudflare账户ID
   - 您可以在[Cloudflare仪表盘](https://dash.cloudflare.com/)的右下角找到账户ID
3. (可选) 在`[vars]`部分添加环境变量
   - 例如: 管理员用户名和密码哈希

## 步骤2: 登录Wrangler

在命令行中运行以下命令登录Cloudflare:

```bash
wrangler login
```

## 步骤3: 部署Worker

在项目根目录运行以下命令部署Worker:

```bash
wrangler deploy
```

## 步骤4: 配置前端以连接后端

1. 部署成功后，Cloudflare会提供一个Worker URL
2. 打开`next-app/index.html`文件
3. 更新JavaScript代码中的API调用地址，将其指向您的Worker URL

例如，将:
```javascript
fetch('/api/login', ...)
```

改为:
```javascript
fetch('https://your-worker-url.workers.dev/api/login', ...)
```

## 步骤5: 测试后端服务

1. 使用Postman或其他API测试工具测试您的后端端点
2. 确保所有CRUD操作都能正常工作
3. 测试管理员登录功能

## 注意事项
- 本Worker使用内存存储数据，重启后数据会丢失。在生产环境中，应使用Cloudflare KV或其他持久化存储解决方案
- 实际应用中，应使用环境变量存储敏感信息，如管理员密码
- 为了安全起见，应使用JWT库进行令牌生成和验证，而不是简单的字符串比较
- 定期更新`compatibility_date`以使用最新的Cloudflare Worker功能

## 扩展建议
1. 使用Cloudflare KV实现数据持久化
2. 添加更多的API端点以满足需求
3. 实现更严格的身份验证和授权机制
4. 添加请求速率限制以防止滥用

祝您部署顺利！
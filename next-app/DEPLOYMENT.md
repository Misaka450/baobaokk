# Cloudflare Pages 部署指南

## 部署步骤

1. 登录Cloudflare账户，进入Pages控制台
2. 点击"创建项目"，选择"连接到Git"
3. 选择仓库: `Misaka450/baobaokk`
4. 选择分支: `master`
5. 配置构建设置:
   - 构建命令: `npm run build`
   - 构建输出目录: `next-app`
6. 点击"保存并部署"

## 常见问题故障排除

### 404错误解决方法

1. **检查构建输出目录设置**
   - 确保Cloudflare Pages控制台中的"构建输出目录"设置为`next-app`
   - 检查wrangler.toml文件中的`build_output_dir`是否也设置为`next-app`

2. **确认index.html存在**
   - 确保next-app目录下有index.html文件
   - 检查文件名称是否正确(区分大小写)

3. **检查部署分支**
   - 确保部署的是包含最新更改的分支(master)
   - 确认代码已正确推送到GitHub

4. **查看构建日志**
   - 在Cloudflare Pages控制台中查看构建日志，检查是否有错误
   - 确保构建命令`npm run build`执行成功

5. **检查路由规则**
   - 确认没有设置可能导致404的自定义路由规则
   - 尝试直接访问具体文件，如`https://your-domain.pages.dev/index.html`

## 其他提示

- 如果您修改了wrangler.toml文件，请确保提交并推送更改到GitHub
- 部署完成后，可能需要等待几分钟才能生效
- 如遇到持续问题，请联系Cloudflare支持
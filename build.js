const fs = require('fs');
const path = require('path');

// 定义源目录（也是目标目录）
const sourceDir = path.join(__dirname, 'next-app');

// 检查源目录是否存在
if (!fs.existsSync(sourceDir)) {
  console.error(`Error: Source directory ${sourceDir} not found!`);
  process.exit(1);
}

// 输出成功信息
console.log(`Build process skipped: Using ${sourceDir} as output directory directly`);
console.log('Build completed successfully!');
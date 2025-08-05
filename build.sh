#!/bin/bash

# 创建public目录（如果不存在）
mkdir -p public

# 清空public目录
rm -rf public/*

# 复制next-app目录下的所有文件到public目录
cp -r next-app/* public/

# 输出成功信息
echo 'Build completed: next-app files copied to public directory'
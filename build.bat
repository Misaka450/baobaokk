@echo off

:: 创建public目录（如果不存在）
mkdir public 2>nul

:: 清空public目录
rmdir /s /q public
mkdir public

:: 复制next-app目录下的所有文件到public目录
xcopy /s /e /y next-app\* public\

:: 输出成功信息
echo Build completed: next-app files copied to public directory
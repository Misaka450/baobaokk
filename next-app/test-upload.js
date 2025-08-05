// 测试文件上传功能
const API_URL = 'http://localhost:8080/api';

// 测试上传图片
async function testUploadPhoto() {
  console.log('开始测试文件上传...');

  // 先登录获取凭证
  const loginResponse = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });

  if (!loginResponse.ok) {
    console.error('登录失败:', await loginResponse.text());
    return;
  }

  const loginData = await loginResponse.json();
  console.log('登录成功:', loginData);

  // 创建测试文件
  const blob = new Blob(['test image data'], { type: 'image/jpeg' });
  const file = new File([blob], 'test-image.jpg', { type: 'image/jpeg' });

  // 创建表单数据
  const formData = new FormData();
  formData.append('file', file);
  formData.append('albumId', '1');
  formData.append('description', '测试上传图片');

  // 上传文件
  const uploadResponse = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    credentials: 'include', // 包含cookie
    body: formData
  });

  if (!uploadResponse.ok) {
    console.error('上传失败:', await uploadResponse.text());
    return;
  }

  const uploadData = await uploadResponse.json();
  console.log('上传成功:', uploadData);
  console.log('上传的图片URL:', uploadData.url);

  // 验证图片是否已添加到相册
  const photosResponse = await fetch(`${API_URL}/albums/1/photos`, {
    method: 'GET',
    credentials: 'include'
  });

  if (!photosResponse.ok) {
    console.error('获取相册照片失败:', await photosResponse.text());
    return;
  }

  const photosData = await photosResponse.json();
  console.log('相册1的照片数量:', photosData.length);
  console.log('相册1的所有照片:', photosData);
}

testUploadPhoto().catch(error => {
  console.error('测试出错:', error);
});
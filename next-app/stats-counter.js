// stats-counter.js
// 用于自动统计网站数据并更新UI

// 配置API URL
const STATS_API_URL = 'http://localhost:8787';

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
  // 初始化统计数据
  initStats();
});

// 初始化统计数据
async function initStats() {
  try {
    // 获取时间轴数据和相册数据
    const [timelineData, albumsData] = await Promise.all([
      fetchTimelineData(),
      fetchAlbumsData()
    ]);

    // 计算并更新统计数据
    updateMemoryCount(timelineData);
    updateRelationshipDays(timelineData);
    updateTravelPlaces(albumsData);
    updateAnniversaryCount(albumsData);
  } catch (error) {
    console.error('获取统计数据失败:', error);
    // 在开发环境下使用模拟数据
    if (STATS_API_URL.includes('localhost')) {
      useMockData();
    }
  }
}

// 获取时间轴数据
async function fetchTimelineData() {
  const response = await fetch(`${STATS_API_URL}/api/timeline`);
  if (!response.ok) throw new Error('获取时间轴数据失败');
  return response.json();
}

// 获取相册数据
async function fetchAlbumsData() {
  const response = await fetch(`${STATS_API_URL}/api/albums`);
  if (!response.ok) throw new Error('获取相册数据失败');
  return response.json();
}

// 更新共同回忆数量
function updateMemoryCount(timelineData) {
  const count = timelineData.length;
  const element = document.querySelector('.scroll-trigger:nth-child(1) .text-4xl');
  if (element) {
    animateCounter(element, 0, count, 1500);
  }
}

// 更新恋爱天数
function updateRelationshipDays(timelineData) {
  if (timelineData.length === 0) return;

  // 找到最早的时间轴项目日期
  const earliestDate = timelineData
    .reduce((min, item) => new Date(item.date) < new Date(min.date) ? item : min, timelineData[0])
    .date;

  // 计算从最早日期到今天的天数
  const startDate = new Date(earliestDate);
  const today = new Date();
  const timeDiff = Math.abs(today - startDate);
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  const element = document.querySelector('.scroll-trigger:nth-child(2) .text-4xl');
  if (element) {
    animateCounter(element, 0, daysDiff, 1500);
  }

  // 更新总秒数显示
  const totalSecondsElement = document.getElementById('total-seconds');
  if (totalSecondsElement) {
    const secondsDiff = Math.ceil(timeDiff / 1000);
    totalSecondsElement.textContent = `总共: ${secondsDiff.toLocaleString()} 秒`;
  }
}

// 更新旅行地点数量
function updateTravelPlaces(albumsData) {
  // 找到旅行相关的相册并计算照片总数
  const travelAlbum = albumsData.find(album =>
    album.title.toLowerCase().includes('旅行') ||
    album.description.toLowerCase().includes('旅行')
  );

  const travelPhotosCount = travelAlbum ? travelAlbum.photoCount : 0;
  const element = document.querySelector('.scroll-trigger:nth-child(3) .text-4xl');
  if (element) {
    animateCounter(element, 0, travelPhotosCount, 1500);
  }
}

// 更新纪念日数量
function updateAnniversaryCount(albumsData) {
  // 找到纪念日相册
  const anniversaryAlbum = albumsData.find(album =>
    album.title.toLowerCase().includes('纪念日') ||
    album.description.toLowerCase().includes('纪念日')
  );

  // 如果有纪念日相册，使用其照片数量；否则使用时间轴项目数量
  const count = anniversaryAlbum ? anniversaryAlbum.photoCount : 0;
  const element = document.querySelector('.scroll-trigger:nth-child(4) .text-4xl');
  if (element) {
    animateCounter(element, 0, count, 1500);
  }
}

// 数字动画效果
function animateCounter(element, start, end, duration) {
  let startTime = null;
  const step = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    element.textContent = value.toLocaleString();
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// 在开发环境下使用模拟数据
function useMockData() {
  console.log('使用模拟数据进行统计');

  // 模拟时间轴数据
  const mockTimeline = [
    { id: 1, date: '2023-10-08', title: '我们的第一天', description: '第一次相遇的日子' },
    { id: 2, date: '2023-10-15', title: '第一次约会', description: '一起看电影和吃饭' },
    { id: 3, date: '2023-11-08', title: '确定关系', description: '正式成为情侣' }
  ];

  // 模拟相册数据
  const mockAlbums = [
    { id: 1, title: '旅行回忆', description: '我们一起去过的地方', photoCount: 24 },
    { id: 2, title: '美食日记', description: '一起品尝的美食', photoCount: 18 },
    { id: 3, title: '纪念日', description: '特殊的日子', photoCount: 12 }
  ];

  // 更新统计数据
  updateMemoryCount(mockTimeline);
  updateRelationshipDays(mockTimeline);
  updateTravelPlaces(mockAlbums);
  updateAnniversaryCount(mockAlbums);
}
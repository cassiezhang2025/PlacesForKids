// Load the addresses from the JSON file
fetch('https://api.sheetbest.com/sheets/776bfffa-c92b-4915-9fb6-945e2b3762e4')
  .then(response => response.json())
  .then(data => {
    const addresses = data;
    initializeMap(addresses);
  })
  .catch(error => console.error('Error loading addresses:', error));

function initializeMap(addresses) {
  // 初始化地图并设置中心点
  const map = L.map('map').setView([40.0583, -74.4057], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map);

  const markers = {};     // 分类的 marker
  const allMarkers = [];  // 所有 marker

  // 添加所有地址到地图上
  addresses.forEach(address => {
    const marker = L.marker([address.lat, address.lng]).addTo(map);
    marker.bindPopup(`<b>${address.name}</b><br>${address.address}`);
    marker.addressData = address; // 用于搜索匹配
    allMarkers.push(marker);

    const category = address.category.toLowerCase();
    if (!markers[category]) {
      markers[category] = [];
    }
    markers[category].push(marker);
  });

  // 分类按钮点击事件
  document.getElementById('museumBtn').addEventListener('click', () => toggleMarkers('museum', markers, map));
  document.getElementById('zooBtn').addEventListener('click', () => toggleMarkers('zoo', markers, map));
  document.getElementById('playgroundBtn').addEventListener('click', () => toggleMarkers('playground', markers, map));
  document.getElementById('farmBtn').addEventListener('click', () => toggleMarkers('farm', markers, map));
  document.getElementById('hikingBtn').addEventListener('click', () => toggleMarkers('hiking', markers, map));
  document.getElementById('eventBtn').addEventListener('click', () => toggleMarkers('event', markers, map));

  // 搜索按钮点击事件
  document.getElementById('searchBtn').addEventListener('click', () => {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    allMarkers.forEach(marker => {
      const { name, address } = marker.addressData;
      const isMatch =
        name.toLowerCase().includes(searchTerm) ||
        address.toLowerCase().includes(searchTerm);
      if (isMatch) {
        marker.addTo(map);
      } else {
        map.removeLayer(marker);
      }
    });
  });

  // 回车键触发搜索
  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('searchBtn').click();
    }
  });

  // Reset 按钮显示所有 marker
  document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    allMarkers.forEach(marker => marker.addTo(map));
  });
}

// 显示/隐藏指定分类的 marker
function toggleMarkers(category, markers, map) {
  Object.keys(markers).forEach(key => {
    if (key === category) {
      markers[key].forEach(marker => marker.addTo(map));
    } else {
      markers[key].forEach(marker => map.removeLayer(marker));
    }
  });
}

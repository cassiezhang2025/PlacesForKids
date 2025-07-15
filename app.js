// 动态加载地址数据（来自 SheetBest）
fetch('https://api.sheetbest.com/sheets/776bfffa-c92b-4915-9fb6-945e2b3762e4')
  .then(response => response.json())
  .then(data => {
    const addresses = data;
    initializeMap(addresses);
  })
  .catch(error => console.error('Error loading addresses:', error));

function initializeMap(addresses) {
  // 初始化地图并定位到新泽西
  const map = L.map('map').setView([40.0583, -74.4057], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map);

  const allMarkers = [];
  const categoryMarkers = {};

  // 创建标记并分类
  addresses.forEach(address => {
    if (!address.lat || !address.lng) return;

    const lat = parseFloat(address.lat);
    const lng = parseFloat(address.lng);
    const categoryList = address.category?.toLowerCase().split(',').map(c => c.trim()) || [];

    const popupText = `<b>${address.name}</b><br>${address.address || ''}<br>${address.note || ''}`;
    const marker = L.marker([lat, lng]).bindPopup(popupText);
    marker.addTo(map);
    allMarkers.push(marker);

    categoryList.forEach(cat => {
      if (!categoryMarkers[cat]) {
        categoryMarkers[cat] = [];
      }
      categoryMarkers[cat].push(marker);
    });
  });

  // 搜索按钮点击
  document.getElementById('searchBtn').addEventListener('click', () => {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    addresses.forEach(address => {
      const fields = [
        address.name,
        address.address,
        address.note,
        address.city,
        address.state,
        address.zipcode
      ];

      const match = fields.some(field =>
        field && field.toLowerCase().includes(searchTerm)
      );

      if (match) {
        const lat = parseFloat(address.lat);
        const lng = parseFloat(address.lng);
        const popupText = `<b>${address.name}</b><br>${address.address || ''}<br>${address.note || ''}`;
        if (address.link) {
          popupText += `<br><a href="${address.link}" target="_blank">More info</a>`;
        }

        const marker = L.marker([lat, lng]).bindTooltip(address.name).bindPopup(popupText).addTo(map);
        marker.openPopup();
        allMarkers.push(marker);
      }
    });
  });

  // ⌨️ 支持按 Enter 触发搜索
  document.getElementById('searchInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      document.getElementById('searchBtn').click();
    }
  });

  // Reset 按钮：恢复所有
  document.getElementById('resetBtn').addEventListener('click', () => {
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });
    allMarkers.forEach(marker => marker.addTo(map));
  });

  // 分类按钮点击事件
  document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category.toLowerCase();
      map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });
      if (categoryMarkers[category]) {
        categoryMarkers[category].forEach(marker => marker.addTo(map));
      }
    });
  });
}

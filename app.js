// Load the addresses from the JSON file
fetch('https://api.sheetbest.com/sheets/776bfffa-c92b-4915-9fb6-945e2b3762e4')
  .then(response => response.json())
  .then(data => {
    const addresses = data;
    initializeMap(addresses);
  })
  .catch(error => console.error('Error loading addresses:', error));

  function initializeMap(addresses) {
    const map = L.map('map').setView([40.0583, -74.4057], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);
  
    const markers = {};
    const allMarkers = [];
    const categorySet = new Set();
  
    // 创建 Marker 并收集分类
    addresses.forEach(address => {
      const lat = parseFloat(address.lat);
      const lng = parseFloat(address.lng);
      if (!lat || !lng) return;
  
      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`<b>${address.name}</b><br>${address.address}`);
      marker.addressData = address;
      allMarkers.push(marker);
  
      const categoryStr = (address.category || '').toLowerCase();
      const categoryList = categoryStr.split(',').map(c => c.trim()).filter(c => c);
      
      categoryList.forEach(cat => {
        if (!markers[cat]) {
          markers[cat] = [];
        }
        markers[cat].push(marker);
        categorySet.add(cat);  // 收集所有分类
      });
      
    });
  
    // ✅ 动态生成分类按钮
    const buttonContainer = document.getElementById('categoryButtons');
    categorySet.forEach(cat => {
      const btn = document.createElement('button');
      btn.textContent = capitalize(cat);
      btn.addEventListener('click', () => toggleMarkers(cat, markers, map));
      buttonContainer.appendChild(btn);
    });
  
    // 搜索逻辑
    document.getElementById('searchBtn').addEventListener('click', () => {
      const term = document.getElementById('searchInput').value.toLowerCase();
      allMarkers.forEach(marker => {
        const d = marker.addressData;
        const isMatch =
          (d.name || '').toLowerCase().includes(term) ||
          (d.address || '').toLowerCase().includes(term) ||
          (d.city || '').toLowerCase().includes(term) ||
          (d.state || '').toLowerCase().includes(term) ||
          (d.zipcode || '').toLowerCase().includes(term);
  
        if (isMatch) {
          marker.addTo(map);
        } else {
          map.removeLayer(marker);
        }
      });
    });
  
    document.getElementById('searchInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
      }
    });
  
    document.getElementById('resetBtn').addEventListener('click', () => {
      document.getElementById('searchInput').value = '';
      allMarkers.forEach(marker => marker.addTo(map));
    });
  }
  
  // 工具函数：首字母大写
  function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
  
  // 显示/隐藏 Marker
  function toggleMarkers(category, markers, map) {
    Object.keys(markers).forEach(key => {
      if (key === category) {
        markers[key].forEach(marker => marker.addTo(map));
      } else {
        markers[key].forEach(marker => map.removeLayer(marker));
      }
    });
  }
  
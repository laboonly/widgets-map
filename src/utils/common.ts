
// 加载高德地图地图编码插件
function loadGeocoder() {
  return new Promise<object>(resolve => {
    window.AMap.plugin('AMap.Geocoder', () => {
      const geocoder = new window.AMap.Geocoder({
        // city 指定进行编码查询的城市，支持传入城市名、adcode 和 citycode
        city: '全国'
      });
      resolve(geocoder);
    });
  });
}

// 加载高德地图公交路径规划插件
function loadTransfer(amap) {
  return new Promise<object>(resolve => {
    window.AMap.plugin('AMap.Transfer', () => {
      const transfer = new window.AMap.Transfer({
        // city 指定进行编码查询的城市，支持传入城市名、adcode 和 citycode
        city: '深圳',
        map: amap,
        hideMarkers: true,
        extensions: 'all',
        policy: 'LEAST_TIME',
        panel: 'commute'
      });
      resolve(transfer);
    });
  })
}

// 加载高德地图地图插件
function loadAmapUI() {
  return new Promise<object>(resolve => {
    window.AMapUI.loadUI(['overlay/SimpleMarker'], (SimpleMarker: any) => {
      resolve(SimpleMarker);
    })
  })
}

// 根据地址获取去高德地图定位点
function getLocationAsync(record: any) {
  return new Promise((resolve, reject) => {
    window.Geocoder.getLocation(record.address, function(status, result) {
      if (status === 'complete' && result.info === 'OK') {
        const { lng, lat} = result.geocodes[0].location;
        resolve({ ...record, location: { lng, lat}});
      }
    });
  });
}

// 创建路劲规划
async function creatTransfer(pointA, pointB) {
  return new Promise<void>(resolve => {
    window.Transfer.search(pointA, pointB, function(status, result) {
        if (status === 'complete') {
            console.log(result);
            resolve()
        } else {
            console.log('获取驾车数据失败：' + result);
        }
    });
  });
}

export { loadGeocoder, loadTransfer, loadAmapUI, getLocationAsync, creatTransfer }
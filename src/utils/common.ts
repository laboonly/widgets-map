
// 根据地址获取去高德地图定位点
function getLocationAsync(record: any) {
  return new Promise((resolve, reject) => {
    const geocoder = new window.AMap.Geocoder({
      city: '全国'
    });
    geocoder.getLocation(record.address, function(status, result) {
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
    const transfer = new window.AMap.Transfer({
        // city 指定进行编码查询的城市，支持传入城市名、adcode 和 citycode
        city: '深圳',
        map: window.amap,
        hideMarkers: true,
        extensions: 'all',
        policy: 'LEAST_TIME',
        panel: 'commute'
      });
    transfer.search(pointA, pointB, function(status, result) {
        if (status === 'complete') {
            console.log(result);
            resolve()
        } else {
            console.log('获取驾车数据失败:' + result);
        }
    });
  });
}

export { getLocationAsync, creatTransfer }
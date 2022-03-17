
// 根据地址获取去高德地图定位点
function getLocationAsync(record: any) {
  return new Promise((resolve, reject) => {
    window.Geocoder.getLocation(record['地址'], function(status, result) {
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
            console.log('获取驾车数据失败:' + result);
        }
    });
  });
}

export { getLocationAsync, creatTransfer }
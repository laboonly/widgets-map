import React, { useState, useEffect, useContext, useReducer } from 'react';
import { useCloudStorage, useRecords, useFields } from '@vikadata/widget-sdk';
import { Setting } from './setting';
import { Information } from './components/information'
import APILoader from './utils/APILoader';


//设置地图安全密钥
window['_AMapSecurityConfig'] = {
  securityJsCode:'41d2e666297c21beda8897b2dfecc92f',
}

declare global {
  interface Window { AMap: any; AMapUI: any; }
}

interface houseType {
  title: string,
	address: string,
	info: string,
	price: number,
	contact: number,
}


// 根据地址过去高德地图定位点
function getLocationAsync(record: any, geocoder: any) {
  return new Promise((resolve, reject) => {
    geocoder.getLocation(record.address, function(status, result) {
      if (status === 'complete' && result.info === 'OK') {
        console.log('result', result)
        const { lng, lat} = result.geocodes[0].location;
        resolve({ ...record, location: { lng, lat}});
      }
    });
  });
}

// 创建标记点
function creatMarker(
  amap: any, 
  SimpleMarker: any, 
  record: any, 
  color: string, 
  text: string,
  setHouseinfo?: any,
  mapCenterLocation?: any,
  transfer?: any,
  informationRef?: any,
  ) {

  const marker =  new SimpleMarker({
    //前景文字
      iconLabel: text,
      //图标主题
      iconTheme: 'fresh',
      //背景图标样式
      iconStyle: color,
      //...其他Marker选项...，不包括content
      map: amap,
      clickable: true,
      position: [record.location.lng, record.location.lat]
  });
  
  if(mapCenterLocation) {
    marker.on('click', (e) => {
      console.log('info', record);
      setHouseinfo({
        title: record.title,
        address: record.address,
        info: record.info,
        price: record.price,
        contact: record.contact,
      })
      const infoWindow = new window.AMap.InfoWindow({
          content: informationRef.current.innerHTML,  //传入 dom 对象，或者 html 字符串
          offset: new window.AMap.Pixel(0, -40)
      });
      creatTransfer(transfer, [mapCenterLocation.lng, mapCenterLocation.lat], [record.location.lng, record.location.lat]);
      infoWindow.open(amap, [record.location.lng, record.location.lat])
    });
  }
  return marker
}

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

// 根据地址搜索增加marker点
async function markAddress(amap: any, 
  simpleMarker: any, 
  recordsData: Array<any>, 
  geocoder: object, 
  markersLayer: Array<object>, 
  setMakerslayer: any,
  setHouseinfo: any,
  mapCenterLocation: any,
  transfer: any,
  informationRef: any,
  ) {

  if(markersLayer) {
    amap.remove(markersLayer);
  }
  const asyncRecords = recordsData.map(record => getLocationAsync(record, geocoder));
  const Records = await Promise.all(asyncRecords);
  const markers = Records.map((record: any) => { 
    
    return creatMarker(amap, simpleMarker, record, 'lightgreen', 'H', setHouseinfo, mapCenterLocation, transfer, informationRef)
  });
  // amap.add(markers);
  console.log('markers', markers);
  setMakerslayer(markers);
}

// 创建路劲规划
async function creatTransfer(transfer: any, pointA, pointB) {
  return new Promise<void>(resolve => {
    transfer.search(pointA, pointB, function(status, result) {
        if (status === 'complete') {
            console.log(result);
            resolve()
        } else {
            console.log('获取驾车数据失败：' + result);
        }
    });
  })
}

const MapContent: React.FC = () => {
  const [viewId] = useCloudStorage<string>('selectedViewId');

  // 获取所有列的信息
  const fields = useFields(viewId);
  // 获取所有行的信息
  const records = useRecords(viewId);

  const [recordsData, setRecordsdata] = useState<any>();
  const [amap, setAmap] = useState<any>();
  const [geocoder, setGeocoder] = useState<object>();
  
  // const [mapCenter] = useCloudStorage<string>('mapCenter');
  const { mapCenter } = useContext(MapCenter);
  const [mapCenterLocation, setMapCenterLocation] = useState<any>();

  

  // 公交路线规划
  const [transfer, setTransfer] = useState<object>();

  // 地图标点集合
  const [markersLayer, setMakerslayer] = useState<any>(null);

  useEffect(function getAddressList() {
      const addressFieldId = fields.find(field => field.name === '地址')!.id;
      const titleFieldId = fields.find(field => field.name === '名称')!.id;
      const infoFieldId = fields.find(field => field.name === '优缺点')!.id;
      const priceFieldId = fields.find(field => field.name === '价格')!.id;
      const contactFieldId = fields.find(field => field.name === '地址')!.id;
      
      // 获取表格所有地址
      const recordsData: any[] = records
        .map(record => { 
          console.log('record', record);
          return { 
            title: record.getCellValue(titleFieldId),
            address: record.getCellValue(addressFieldId),
            info: record.getCellValue(infoFieldId),
            price: record.getCellValue(priceFieldId),
            contact: record.getCellValue(contactFieldId)
          }
        })
        .filter(addr => addr != null);
        setRecordsdata(recordsData);
  },[records]);
  
  const informationRef = React.useRef();

  // 房子信息
  const [houseInfo, setHouseinfo] = useState<houseType>({
    title: '',
    address: '',
    info: '',
    price: 1222,
    contact: 1111,
  }) 

  // 组件初始化时，加载 sdk 实例
  useEffect(() => {
   
    new APILoader({
        key: '5b625cd96fdd79c2918cf5ec2cd7720c',
        version: null,
        protocol: 'https'
    }).load().then(() => {
      const lnglat = new window.AMap.LngLat(114.031040, 22.624386);
      const amap = new window.AMap.Map('container', {
        zoom: 12,//级别
        center: lnglat,//中心点坐标
        viewMode: '3D',//使用3D视图
        mapStyle: 'amap://styles/b379277160c9c3ce520627ad2e4bd22c'
      });
      
      setAmap(amap);
      // 加载地图编码
      loadGeocoder().then(geocoder => {
        console.log('geocoder', geocoder);
        setGeocoder(geocoder);
        getLocationAsync({ 
          title: '',
          address: mapCenter,
          info: '',
          price: '',
          contact: ''
        }, geocoder).then((record: any )=> {
          amap.setCenter([record.location.lng, record.location.lat]);
          setMapCenterLocation(record.location)
          // 加载AmapUI 然后创建中心点标点
          loadAmapUI().then( (SimpleMarker: any)=> {
            creatMarker(amap, SimpleMarker, record, 'orange', 'C');
          });
          
        });
      });
      
      //加载路径规划
      loadTransfer(amap).then(transfer => {
        console.log('Transfer', transfer);
        setTransfer(transfer);
      });
    });
   
  }, [mapCenter]);

  useEffect(() => {

  }, [houseInfo])

  useEffect(function drawAddress() {
    if (!amap || !recordsData || !geocoder || !transfer || !mapCenterLocation) {
      return;
    }
    console.log('houseInfo', houseInfo)
    // 标注点
    loadAmapUI().then((SimpleMarker: any)=> {
      markAddress(amap, SimpleMarker, recordsData, geocoder, markersLayer, setMakerslayer, setHouseinfo, mapCenterLocation, transfer, informationRef);
    });
  }, [recordsData, amap, geocoder, transfer, mapCenterLocation, houseInfo])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div id="container" style={{ width: '100%', height: '100%' }}>
      </div>
        <Information 
        ref={informationRef}
        title={houseInfo.title}
        address={houseInfo.address}
        info={houseInfo.info}
        price={houseInfo.price}
        contact={houseInfo.contact}
      />
    </div>
  );
}

export const MapCenter = React.createContext({});

function reducer(state: any, action: any) {
  switch (action.type) {
    case "change":
      return action.value;
  }
}

export const MapComponent: React.FC = () => {
  const [mapCenter, dispatch] = useReducer(reducer, '深圳');
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flexGrow: 1, overflow: 'auto', padding: '0 8px'}}>
      <MapCenter.Provider value={{ mapCenter, dispatch }}>
        <MapContent />
      </MapCenter.Provider>
      </div>
      <MapCenter.Provider value={{ mapCenter, dispatch }}>
        <Setting />
      </MapCenter.Provider>
    </div>
  );
};

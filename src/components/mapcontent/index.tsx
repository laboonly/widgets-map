import React, { useState, useEffect } from 'react';
import { useCloudStorage, useRecords } from '@vikadata/widget-sdk';
import { Information } from '../information';
import { getLocationAsync, creatTransfer } from '../../utils/common';

interface mapContentProps {
  pluginStatus: boolean
}

interface houseType {
  title: string, // 名称
	address: string, // 地址
	info: string, // 出租房信息
	price: number, // 价格
	contact: number, // 联系方式
}

interface markConfig {
  iconStyle: string,  //背景图标样式
  iconLabel: string,  //前景文字 
  iconTheme: string, //图标主题 
}

interface locationType{
  lng: string,
  lat: string,
}

const conterMarkerConfig = {
  iconLabel: 'C',
  iconStyle: 'orange',
  iconTheme: 'fresh'
}

const homeMarkerConfig = {
  iconLabel: 'H',
  iconStyle: 'lightgreen',
  iconTheme: 'fresh'
}


export const MapContent: React.FC<mapContentProps> = ({ pluginStatus  }) => {
  // 获取表格视图ID
  const [viewId] = useCloudStorage<string>('selectedViewId');
  // 获取所有行的信息
  const records = useRecords(viewId);
  // 处理完的表格信息
  const [recordsData, setRecordsdata] = useState<any>();
  // 名称
  const [titleId] = useCloudStorage<string>('selectedtitleId');
  // 地址
  const [addressId] = useCloudStorage<string>('selectedAddressId');
  // 优缺点
  const [houseInfoId] = useCloudStorage<string>('selectedHouseInfoId');
  // 价格
  const [priceId] = useCloudStorage<string>('selectPrice');
  // 联系方式
  const [contactId] = useCloudStorage<string>('selectContact');
  // 地图中心地址
  const [mapCenter] = useCloudStorage<string>('mapCenter');
  // 地图中心定位
  const [mapCenterLocation, setMapCenterLocation] = useState<locationType>();
  // 中心标点
  const [markerCenter, setMarkercenter] = useState<any>();
  // 地图标点集合
  const [markersLayer, setMakerslayer] = useState<any>(null);
  // 信息窗口DOM引用
  const informationRef = React.useRef();
  // 房子信息
  const [houseInfo, setHouseinfo] = useState<houseType>({
    title: '',
    address: '',
    info: '',
    price: 1222,
    contact: 1111,
  });

  // 地址处理
  useEffect(function getAddressList() {
    // 获取表格所有地址
    const recordsData: any[] = records
      .map(record => { 
        return { 
          title: record.getCellValue(titleId),
          address: record.getCellValue(addressId),
          info: record.getCellValue(houseInfoId),
          price: record.getCellValue(priceId),
          contact: record.getCellValue(contactId)
        }
      });
    setRecordsdata(recordsData);
  },[records, titleId, addressId, houseInfoId, priceId, contactId]);

  // 创建中心点坐标
  useEffect(function setCenter(){
    if(!window.amap || !pluginStatus) {
      return;
    }
    if(markerCenter) {
      window.amap.remove(markerCenter);
    }
    getLocationAsync({ 
      title: '',
      address: mapCenter,
      info: '',
      price: '',
      contact: ''
    }).then((record: any )=> {
      window.amap.setCenter([record.location.lng, record.location.lat]);
      setMapCenterLocation(record.location);
      //创建中心点标点 并且设置
      setMarkercenter(creatMarker(record, conterMarkerConfig));
    });   
  },[window.amap, mapCenter, pluginStatus]);

  // 根据表格设置所有地图点
  useEffect(function drawAddress() {
    console.log('pluginStatus', pluginStatus);
    if (!pluginStatus || !recordsData  || !mapCenterLocation) {
      return;
    }
    markAddress(recordsData, markersLayer, mapCenterLocation, informationRef);
  }, [recordsData, mapCenterLocation, pluginStatus]);

  /* 创建标记点 
  record: 标点信息
  markerConfig: 标点参数配置
  transfer: 创建路径对象
  informationRef: 信息窗体DOM引用
  */
  function creatMarker(
    record: any, 
    markerConfig: markConfig,
    mapCenterLocation?: locationType,
    informationRef?: any,
  ) {

    const marker =  new window.AMapUI.SimpleMarker({
      ...markerConfig,
      //...其他Marker选项...，不包括content
      map: window.amap,
      clickable: true,
      position: [record.location.lng, record.location.lat]
    });
    
    if(mapCenterLocation) {
      marker.on('click', () => {
        setHouseinfo(record);
        const infoWindow = new window.AMap.InfoWindow({
            content: informationRef.current.innerHTML,  //传入 dom 对象，或者 html 字符串
            offset: new window.AMap.Pixel(0, -40),
            closeWhenClickMap: true, // 点击地图关闭
            autoMove: true
        });
        creatTransfer([record.location.lng, record.location.lat], [mapCenterLocation.lng, mapCenterLocation.lat]);
        infoWindow.open(window.amap, [record.location.lng, record.location.lat]);
      });
    }
    return marker;
  }

  /* 根据地址搜索增加marker点 
  recordsData: 表格数据
  markersLayer: 之前已经创建的marker图层
  setHouseinfo: 设置标点信息函数
  mapCenterLocation: 中心点坐标
  informationRef: 信息窗口DOM
  */
  async function markAddress( 
    recordsData: Array<any>, 
    markersLayer: Array<any>, 
    mapCenterLocation: locationType,
    informationRef: any,
  ) {

    if(markersLayer) {
      window.amap.remove(markersLayer);
    }

    const asyncRecords = recordsData.map(record => getLocationAsync(record));
    const Records = await Promise.all(asyncRecords);
    const markers = Records.map((record: any) => { 
      return creatMarker(record, homeMarkerConfig, mapCenterLocation, informationRef);
    });

    setMakerslayer(markers);
  }

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
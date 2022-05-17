import React, { useState, useEffect } from 'react';
import { useCloudStorage, useRecords } from '@vikadata/widget-sdk';
import { Information } from '../information';
import { getLocationAsync, creatTransfer } from '../../utils/common';
import { useDebounce, useMount } from 'ahooks';
import { TextInput } from '@vikadata/components';
import style from './index.module.css';


interface mapContentProps {
  pluginStatus: boolean
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
  iconLabel: '',
  iconStyle: 'orange',
  iconTheme: 'fresh'
}

const homeMarkerConfig = {
  iconLabel: '',
  iconStyle: 'lightgreen',
  iconTheme: 'fresh'
}

interface InfolistType{
  text: string,
  value: string,
}


export const MapContent: React.FC<mapContentProps> = ({ pluginStatus  }) => {
  // 获取表格视图ID
  const [viewId] = useCloudStorage<string>('selectedViewId');
  // 获取所有行的信息
  const records = useRecords(viewId);
  // 处理完的表格信息
  const [recordsData, setRecordsdata] = useState<any>();

  const [infoWindowList] = useCloudStorage<Array<InfolistType>>('infoWindowList');
  const [infoWindowListStatus] = useCloudStorage<boolean>('infoWindowListStatus');

  // 地图中心地址
  const [mapCenter] = useCloudStorage<string>('mapCenter');
  // 地图中心定位
  const [mapCenterLocation, setMapCenterLocation] = useState<locationType>();
  // 中心标点
  const [markerCenterLayer, setMarkerCenterLayer] = useState<any>();
  // 地图标点集合
  const [markersLayer, setMakerslayer] = useState<any>(null);
  // 信息窗口DOM引用
  const informationRef = React.useRef();
  // 点位信息
  const [markInfo, setMarkInfo] = useState<any>();
  // 搜索输入
  const [searchKey, setSearchKey] = useState<string>();
  const debouncedSearchKey = useDebounce(searchKey, { wait: 500 });

  // 搜索处理
  // useEffect(() => {
    
  //   // 根据关键字进行搜索
  //   window.AutoComplete.search(debouncedSearchKey, function(status, result) {
  //     // 搜索成功时，result即是对应的匹配数据
  //     console.log('result', result);
  //   });
    
  // }, [debouncedSearchKey]);

  useEffect(() => {
    if(!window.AutoComplete) {
      return;
    }
    window.AutoComplete.clearEvents("select");
    window.AutoComplete.on("select", select);
  }, [window.AutoComplete, window.amap, debouncedSearchKey]);

  function select(e) {
      setSearchKey(e.poi.name);
      //创建标点 并且设置为地图中心
      
      if(markerCenterLayer) {
        window.amap.remove(markerCenterLayer);
      } 
      const centerMarker = new window.AMapUI.SimpleMarker({
        ...conterMarkerConfig,
        //...其他Marker选项...，不包括content
        map: window.amap,
        clickable: true,
        position: [e.poi.location.lng, e.poi.location.lat]
      });
      setMarkerCenterLayer(centerMarker);
      window.amap.setCenter([ e.poi.location.lng, e.poi.location.lat]);
  };

  // 地址处理
  useEffect(function getAddressList() {
    if(!infoWindowListStatus) {
      return;
    }
    const infoListObj = infoWindowList.reduce((pre, current, index) => {
      if(index === 1) {
        const obj = {
          [pre.text] : pre.value
        }
        pre = obj;
      }
      pre[current.text] = current.value
      return pre;
    });
    // 获取表格所有地址
    const recordsData: any[] = records
      .map(record => {
        let resObj = {}
        for(let key in infoListObj) {
          resObj[key] = record.getCellValue(infoListObj[key]);
        }
        return resObj;
      });
    setRecordsdata(recordsData);
  },[records, infoWindowListStatus, infoWindowList]);

  // 创建中心点坐标
  useEffect(function setCenter(){
    if(!window.amap || !pluginStatus) {
      return;
    }
    if(markerCenterLayer) {
      window.amap.remove(markerCenterLayer);
    }
    getLocationAsync({ 
      ['地址']: mapCenter,
    }).then((record: any )=> {
      window.amap.setCenter([record.location.lng, record.location.lat]);
      setMapCenterLocation(record.location);
      //创建中心点标点 并且设置
      // setMarkercenter(creatMarker(record, conterMarkerConfig));
    });   
  },[window.amap, mapCenter, pluginStatus]);
 
  // 根据表格设置所有地图点
  useEffect(function drawAddress() {
    console.log('infoWindowListStatus', infoWindowListStatus, pluginStatus, recordsData, mapCenterLocation);
    if (!pluginStatus || !recordsData  || !infoWindowListStatus) {
      return;
    }
    const infoWindow = new window.AMap.InfoWindow({
        content: '',  //传入 dom 对象，或者 html 字符串
        offset: new window.AMap.Pixel(0, -40),
        closeWhenClickMap: true, // 点击地图关闭
        autoMove: true
    });
    window.infoWindow = infoWindow;
    markAddress(recordsData, markersLayer, informationRef);
  }, [recordsData, pluginStatus, infoWindowListStatus]);

  /* 创建标记点 
  record: 标点信息
  markerConfig: 标点参数配置
  transfer: 创建路径对象
  informationRef: 信息窗体DOM引用
  */
  function creatMarker(
    record: any, 
    markerConfig: markConfig,
    informationRef?: any
  ) {
    if(!record.location) {
      return;
    }
    const marker =  new window.AMapUI.SimpleMarker({
      ...markerConfig,
      //...其他Marker选项...，不包括content
      map: window.amap,
      clickable: true,
      position: [record.location.lng, record.location.lat]
    });
    
    
    marker.on('click', () => {
      setMarkInfo(record);
      setTimeout(() => {
      window.infoWindow.setContent(informationRef.current.innerHTML);
      // creatTransfer([record.location.lng, record.location.lat], [mapCenterLocation.lng, mapCenterLocation.lat]);
      window.infoWindow.open(window.amap, [record.location.lng, record.location.lat]);
      });
    });
    
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
    informationRef: any
  ) {
    console.log('markAddress执行');
    if(markersLayer) {
      window.amap.remove(markersLayer);
    }
    
    const asyncRecords = recordsData.map(record => getLocationAsync(record));
    const Records = await Promise.all(asyncRecords);
    const markers = Records.map((record: any) => { 
      return creatMarker(record, homeMarkerConfig, informationRef);
    });
    console.log('markers标点');
    const cluster = new window.AMap.MarkerClusterer(window.amap, markers);
    console.log(cluster);
    setMakerslayer(markers);
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div id="container" style={{ width: '100%', height: '100%' }}>
          <div className={style.searchContent}>
              <TextInput
                className={style.searchInput}
                placeholder="请输入内容"
                size="small"
                id="searchInput"
                value={searchKey}
                onChange={ e => setSearchKey(e.target.value)}
              />
          </div>
      </div>
      <Information 
        ref={informationRef}
        info={markInfo}
      />
    </div>
  );
}
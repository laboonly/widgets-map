import React, { useState, useEffect } from 'react';
import { useCloudStorage, useRecords, useExpandRecord, IExpandRecord } from '@vikadata/widget-sdk';
import { getLocationAsync } from '../../utils/common';
import { useDebounce } from 'ahooks';
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
  const expandRecord = useExpandRecord();

  const [infoWindowList] = useCloudStorage<Array<InfolistType>>('infoWindowList');
  const [infoWindowListStatus] = useCloudStorage<boolean>('infoWindowListStatus');
  
  // 中心标点
  const [markerCenterLayer, setMarkerCenterLayer] = useState<any>();
  // 地图标点集合
  const [markersLayer, setMakerslayer] = useState<any>(null);

  // 搜索输入
  const [searchKey, setSearchKey] = useState<string>();
  const debouncedSearchKey = useDebounce(searchKey, { wait: 500 });

  // 地址类型
  const [addressType] = useCloudStorage<string | number>('addressType', 'text');
  
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
          resObj[key] = record.getCellValueString(infoListObj[key]) || '';
          resObj['id'] = record.id
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
  },[window.amap, pluginStatus]);
 
  // 根据表格设置所有地图点
  useEffect(function drawAddress() {
    if (!pluginStatus || !recordsData  || !infoWindowListStatus) {
      return;
    }
    markAddress(recordsData, markersLayer, expandRecord);
  }, [recordsData, pluginStatus, infoWindowListStatus]);

  /* 创建标记点 
  record: 标点信息
  markerConfig: 标点参数配置
  transfer: 创建路径对象
  */
  function creatMarker(
    expandRecord: (expandRecordParams: IExpandRecord) => void,
    record: any, 
    markerConfig: markConfig,
  ) {
    if(!record.location) {
      return;
    }
    const marker =  new window.AMapUI.SimpleMarker({
      ...markerConfig,
      title: record['名称'],
      //...其他Marker选项...，不包括content
      map: window.amap,
      clickable: true,
      position: [record.location.lng, record.location.lat]
    });
    

    marker.on('click', () => {
      expandRecord({recordIds: [record.id]});
    });
    
    return marker;
  }

  /* 根据地址搜索增加marker点 
  recordsData: 表格数据
  markersLayer: 之前已经创建的marker图层
  expandRecord: 展开卡片函数
  */
  async function markAddress( 
    recordsData: Array<any>, 
    markersLayer: Array<any>,
    expandRecord: (expandRecordParams: IExpandRecord) => void
  ) {
      

      if(markersLayer) {
        window.amap.remove(markersLayer);
      }
      let recordsRes;
      

      if(addressType === 'text') {
        const asyncRecords = recordsData.map(record => getLocationAsync(record));
        recordsRes = await Promise.all(asyncRecords);
      } else if(addressType === 'latlng') {
        recordsRes = recordsData.map( record => {
          const lonlat = record['地址'] ? record['地址'].split(',') : '';
          
          let location;
          try {
            location = lonlat !== '' ? new window.AMap.LngLat(lonlat[0], lonlat[1]) : null;
          } catch(e) {
            location = null
            console.log(e)
          }
          return {
            location,
            ...record,
          }
      });
    }
    
    const markers = recordsRes && recordsRes.map((record: any) => { 
      return creatMarker(expandRecord, record, homeMarkerConfig);
    }).filter(x => x);
    
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
    </div>
  );
}
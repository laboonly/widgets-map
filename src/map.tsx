import React, { useEffect, useState } from 'react';
import { Setting } from './setting';
import { MapContent } from './components/mapcontent';
import AMapLoader from '@amap/amap-jsapi-loader';


declare global {
  interface Window { 
    AMap: any, // 地图API
    AMapUI: any, // 高德地图UI
    SimpleMarker: any, // 标点UI
    Geocoder: any, // 地图转码
    Transfer: any, // 路线规划
    amap: any, // 地图实例
    infoWindow: any, // 信息弹窗实例
    AutoComplete: any
  }
}

// 地图安全密钥
const securityCode = '41d2e666297c21beda8897b2dfecc92f';
// 高德地图api key
const apiKey = '5b625cd96fdd79c2918cf5ec2cd7720c';

//设置地图安全密钥
window['_AMapSecurityConfig'] = {
  securityJsCode: securityCode,
}

export const MapComponent: React.FC = () => {
  // 插件加载状态
  const [pluginStatus, setPluginstatus] = useState(false);

  function initMap() {
    
    const amap = new window.AMap.Map('container', {
      zoom: 12,//级别
      viewMode: '2D',//使用3D视图
      mapStyle: 'amap://styles/b379277160c9c3ce520627ad2e4bd22c'
    });
    // amap.addControl(new window.AMap.ToolBar());
    // 在图面添加鹰眼控件，在地图右下角显示地图的缩略图
    amap.addControl(new window.AMap.HawkEye({isOpen:true}));
    window.amap = amap;
    window.Transfer = new window.AMap.Transfer({
      // city 指定进行编码查询的城市，支持传入城市名、adcode 和 citycode
      city: '全国',
      map: amap,
      hideMarkers: true,
      extensions: 'all',
      policy: 'LEAST_TIME',
      panel: 'commute'
    });
    window.Geocoder = new window.AMap.Geocoder({
      city: '全国'
    });

    const autoOptions = {
      // 城市，默认全国 
      city: "全国",
      // 使用联想输入的input的id
      input: "searchInput"
    }

    window.AutoComplete = new window.AMap.AutoComplete(autoOptions);
  }

  // 组件初始化时，加载 sdk 地图实例
  useEffect(() => {
    if(window.AMap) {
      setPluginstatus(true);
      initMap();
      return;
    }
    AMapLoader.load({
      "key": apiKey,
      "version": "2.0",
      "plugins":[
        'AMap.Geocoder', 
        "AMap.Transfer", 
        "AMap.ToolBar", 
        "AMap.HawkEye",
        "AMap.AutoComplete",
        "AMap.PlaceSearch",
        "AMap.MarkerClusterer"
      ],
      "AMapUI": {             // 是否加载 AMapUI，缺省不加载
          "version": '1.1',   // AMapUI 版本
          "plugins":['overlay/SimpleMarker'],       // 需要加载的 AMapUI ui插件
      },
    }).then(() => {
      initMap();
      setPluginstatus(true);
    });
   
  }, []);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flexGrow: 1, overflow: 'auto', padding: '0 8px'}}>
        <MapContent pluginStatus={pluginStatus} />
      </div>
        <Setting />
    </div>
  );
};

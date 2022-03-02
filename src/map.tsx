import React, { useEffect, useState } from 'react';
import { Setting } from './setting';
import { MapContent } from './components/mapcontent';
import APILoader from './utils/APILoader';
import { loadGeocoder, loadTransfer, loadAmapUI } from './utils/common';

declare global {
  interface Window { 
    AMap: any, // 地图API
    AMapUI: any, // 高德地图UI
    SimpleMarker: any, // 标点UI
    Geocoder: any, // 地图转码
    Transfer: any, // 路线规划
    amap: any, // 地图实例
  }
}

//设置地图安全密钥
window['_AMapSecurityConfig'] = {
  securityJsCode:'41d2e666297c21beda8897b2dfecc92f',
}

export const MapComponent: React.FC = () => {
  // 插件加载状态
  const [pluginStatus, setPluginstatus] = useState(false);

  // 组件初始化时，加载 sdk 地图实例
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
      window.amap = amap;

      Promise.all([loadGeocoder(), loadAmapUI(), loadTransfer(amap)]).then(res => {
        window.Geocoder = res[0];
        window.SimpleMarker = res[1];
        window.Transfer = res[2];
        setPluginstatus(true);
      });
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

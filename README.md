# 地图小组件

# 【小程序分享】地图信息展示
分享一个可以在地图上展示表格信息的维格地图小程序。

> 已实现功能帮助租房者在租房的时候在地图上进行租房信息对比选出自己心仪的小根据地。

## 项目地址
https://github.com/laboonly/widgets-rent-map

## 功能介绍
本小程序根据表格里面的出租房信息在地图上显示各个出租房的位置，到公司的路线规划，以及详细信息。帮助租房的同学更加立体的对比各个出租房的优缺点，找出自己心仪的房子。

## 使用说明
请先获取高德api的key[高德地图apikey获取](https://lbs.amap.com/api/javascript-api/guide/abc/prepare)，填入src/map.tsx的securityCode和apiKey，启动小程序之后选择，名称，地址，价格，联系方式对应表格的列，以及填入地图中心(公司)。

下面分享一下开发过程

## 开发过程
正好在寻找房子的我，想到如果能用维格表小程序管理租房信息能够实现我找到最优房子的需求的地图小组件就好了,顺便介绍一下维格小程序以及高德地图相关方面的开发。

### 计划需求
需求整理，我期望的是小程序能够在地图上根据表格中的地址展示不同的标点，同时点击标点之后展示标点的详细信息，以及各个出租房到公司的距离。	

### 准备工作
首先根据官方文档[快速上手开发 | 维格表开发者中心](https://vika.cn/developers/widget/quick-start)，创建安装好小程序。
第二个是高德地图开发需要在高德开发者中心，注册号账号并且申请key,[准备-入门-教程-地图 JS API | 高德地图API](https://lbs.amap.com/api/javascript-api/guide/abc/prepare)。
	
### 第一步加载地图
高德JSAPI，更新了V2.0版本，一番尝试之后发现总是没办法加载成功，在咨询了维格的研发同学之后，才知道可能是因为维格对iframe支持有问题，于是决定不适用新版本的api使用之前V.14版本的api。

但是v.14版本的api加载不支持npm，于是我借鉴了之前使用此版本api的react-amap开源框架，关于地图加载的部分。[源码链接](https://github.com/ElemeFE/react-amap/blob/next/components/utils/APILoader.js)，大概思路就是用JS创建script标签加载。首先在小程序的框架下创建utils/ApiLoader.js文件。复制上面链接中的代码。这里的地图mapStyle我使用了[高德的自定义主题](https://lbs.amap.com/api/javascript-api/guide/map/map-style)，你可以选择你喜欢的地图主题，或者自己配置.

```tsx
// 部分代码

  const DEFAULT_CONFIG = {
    v: ‘1.4.0’, // 版本号
    hostAndPath: ‘webapi.amap.com/maps’, // 高德api加载地址
    key: ‘’, // 高德apikey
    callback: ‘_amap_init_callback’, // 回调函数
    useAmapUI: true // 是否使用高德UI
  }

// 获取脚本链接
  getScriptSrc(cfg) {
      return `${this.protocol}//${cfg.hostAndPath}
  ?v=${cfg.v}&key=${cfg.key}&callback=${cfg.callback}`;
  }

// 创建脚本js
  buildScriptTag(src) {
    const script = document.createElement(‘script’);
    script.type = ‘text/javascript’;
    script.async = true; // 异步执行
    script.defer = true; // 页面加载完之后执行
    script.src = src;
    return script;
  }
```
接下来我们在小程序工程src中创建map.tsx文件，引入APILoader，并且创建MapComponent函数组件。填入地图配置参数，这里要注意地图挂载的DOM要设置宽高.

```tsx
import React, { useEffect, useState } from ‘react’;
import { Setting } from ‘./setting’;
import APILoader from ‘./utils/APILoader’;


// 地图安全密钥
const securityCode = ‘高德开发者中心申请key附带的安全密钥’;
// 高德地图api key
const apiKey = ‘高德开发者中心申请的key’;

//设置地图安全密钥
window[‘_AMapSecurityConfig’] = {
  securityJsCode: securityCode,
}

export const MapComponent: React.FC = () => {
	// 组件初始化时，加载 sdk 地图实例
  useEffect(() => {
   
    new APILoader({
        key: apiKey,
        version: null,
        protocol: ‘https’
    }).load().then(() => {
      const lnglat = new window.AMap.LngLat(114.031040, 22.624386);
      const amap = new window.AMap.Map(‘container’, {
        zoom: 12,//级别
        center: lnglat,//中心点坐标
        viewMode: ‘3D’,//使用3D视图
        mapStyle: ‘amap://styles/b379277160c9c3ce520627ad2e4bd22c’
      });
      window.amap = amap;
    }, []);
    
    return (
    <div style={{ display: ‘flex’, height: ‘100%’ }}>
      <div style={{ flexGrow: 1, overflow: ‘auto’, padding: ‘0 8px’}}>
        <div id=“container” style={{ width: ‘100%’, height: ‘100%’ }}>
      </div>
        <Setting />
    </div>
  );
};
```

修改小程序index.tsx的默认代码.

```tsx
import { initializeWidget } from '@vikadata/widget-sdk';
import { MapComponent } from './map';

initializeWidget(MapComponent, process.env.WIDGET_PACKAGE_ID!);

```

接下来我们打开维格小程序开发的网页就可以看到地图已经加载好了。

地图加载好了之后，接下来我们需要根据表格中的地址创建好地图标点。
首先在维格表中创建好名称，地址，优缺点，价格，联系方式等列，填入自己的数据。

这里我们需要使用到两个插件，地图编码插件[geocoder](https://lbs.amap.com/api/javascript-api/guide/services/geocoder),[高德官方UI库](https://lbs.amap.com/api/amap-ui/intro)，在utils下面新建commons.js。实现加载插件代码。同样思路的还有后续的路线规划插件加载。

```tsx

// 加载高德地图地图插件
function loadAmapUI() {
  return new Promise<object>(resolve => {
    window.AMapUI.loadUI(['overlay/SimpleMarker'], (SimpleMarker: any) => {
      resolve(SimpleMarker);
    })
  })
}

/ 加载高德地图地图编码插件
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

```

由于这些插件以及高德地图api的加载是异步的所以我们将这些功能与地图上的功能分开,将之前的地图挂载元素分成mapcontent的小组件，在src中创建components/mapcontent,并且根据维格小程序官方api修改src/seting.tsx. 然后使用useCloudStorage来获取用户设置名称地址等，对应的列的id。然后使用record.getCellValue来获取对应的值。接下来根据这个值通过上面提得到geocoder插件根据地址查询对应点的坐标值，最后使用[高德AMapUI](https://lbs.amap.com/api/amap-ui/reference-amap-ui/overlay/simplemarker)创建对应地址的标点。

mapcontent/index.tsx

```tsx
// 以下是部分代码完整源码请在github查看

import React, { useState, useEffect } from 'react';
import { useCloudStorage, useRecords } from '@vikadata/widget-sdk';
import { getLocationAsync, creatTransfer } from '../../utils/common';
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

    const marker =  new window.SimpleMarker({
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
        creatTransfer([mapCenterLocation.lng, mapCenterLocation.lat], [record.location.lng, record.location.lat]);
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
    </div>
  );

});

```

另外我们需要在setting.tsx里面设置名称，地址等信心对应的列。通过useCloudStorage保存。使用小程序官方的FieldPicker组件选择对应的字段获取ID。

```tsx
// 以下是部分代码完整源码请在github查看

export const Setting: React.FC = () => {

  const [isSettingOpened] = useSettingsButton();

  // 名称
  const [titleId, settitleId] = useCloudStorage<string>('selectedtitleId');
  // 地址
  const [addressId, setAddressId] = useCloudStorage<string>('selectedAddressId');
  // 优缺点
  const [houseInfoId, setHouseInfoId] = useCloudStorage<string>('selectedHouseInfoId');
  // 价格
  const [priceId, setPriceId] = useCloudStorage<string>('selectPrice');
  // 联系方式
  const [contactId, setContactId] = useCloudStorage<string>('selectContact');

  return isSettingOpened ? (
    <div style={{ flexShrink: 0, width: '300px', borderLeft: 'solid 1px gainsboro'}}>
      <h1 style={{ paddingLeft: "5px", marginBottom: 0 }}>设置</h1>
      <div style={{ display: 'flex', height: '100%' }}>
        <div style={{ flexGrow: 1, overflow: 'auto'}}>
        <Box
          padding="30px 10px 60px 10px"
          borderBottom="2px solid lightgrey"
        >
          <FormItem label="View" >
            <ViewPicker   viewId={viewId} onChange={option => setViewId(option.value)} />
          </FormItem>
          <FormItem label="名称">
            <FieldPicker viewId={viewId} fieldId={titleId} onChange={option => settitleId(option.value)} />
          </FormItem>
          <FormItem label="地址">
            <FieldPicker viewId={viewId} fieldId={addressId} onChange={option => setAddressId(option.value)} />
          </FormItem>
          <FormItem label="优缺点">
            <FieldPicker viewId={viewId} fieldId={houseInfoId} onChange={option => setHouseInfoId(option.value)} />
          </FormItem>
          <FormItem label="价格">
            <FieldPicker viewId={viewId} fieldId={priceId} onChange={option => setPriceId(option.value)} />
          </FormItem>
          <FormItem label="联系方式">
            <FieldPicker viewId={viewId} fieldId={contactId} onChange={option => setContactId(option.value)} />
          </FormItem>
          <FormItem label="地图中心">
            <TextInput  style={{  width: '100%!important' }} size="small" value={inputCenter} onChange={ e => setInputcenter(e.target.value)} />
            <Button  style={{ marginTop: 8}} color="primary" size="small" onClick={confirmCenter}>
              确定
            </Button>
          </FormItem>
        </Box>
        </div>
      </div>
    </div>
  ) : null;

});
```

到这里我们基本上完成了从表格中获取值然后在地图上实现标点等功能，后续的详细信息展示以及路线规划也可以使用
相应的插件完成。我已经将源码上传至https://github.com/laboonly/widgets-rent-map 欢迎Star⭐️.

## 后续计划

1. 将标点,信息展示，路线规划变为组件由用户自己选择展示。
2. 添加更多地图功能，如范围点等。

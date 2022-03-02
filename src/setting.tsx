import React, { useState } from 'react';
import { useSettingsButton, useCloudStorage, ViewPicker, FieldPicker } from '@vikadata/widget-sdk';
import { Box, TextInput, Button } from '@vikadata/components'


export const Setting: React.FC = () => {
  const [isSettingOpened] = useSettingsButton();
  const [viewId, setViewId] = useCloudStorage<string>('selectedViewId');

  const [mapCenter, setMapcenter] = useCloudStorage<string>('mapCenter', '深圳市');
  
  const [inputCenter, setInputcenter] = useState<string>(mapCenter);

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

  function confirmCenter() {
    setMapcenter(inputCenter);
  }

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
};


const FormItem = ({label, children}) => {
  return (
    <div style={{display: 'flex', flexDirection: 'column', marginBottom: 16}}>
      <label style={{paddingBottom: 6, fontSize: 13, color: '#636363', fontWeight: 'bold'}}>{label}</label>
      {children}
    </div>
  )
}
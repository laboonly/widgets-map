import React, { useState } from 'react';
import { useSettingsButton, useCloudStorage, ViewPicker } from '@vikadata/widget-sdk';
import { Box, TextInput, Button } from '@vikadata/components'


export const Setting: React.FC = () => {
  const [isSettingOpened] = useSettingsButton();
  const [viewId, setViewId] = useCloudStorage<string>('selectedViewId');

  const [mapCenter, setMapcenter] = useCloudStorage<string>('mapCenter', '深圳市');
  
  const [inputCenter, setInputcenter] = useState<string>(mapCenter);

  function confirmCenter() {
    setMapcenter(inputCenter);
  }

  return isSettingOpened ? (
    <div style={{ flexShrink: 0, width: '300px', borderLeft: 'solid 1px gainsboro'}}>
      <h1 style={{ paddingLeft: "5px", marginBottom: 0 }}>设置</h1>
      <div style={{ display: 'flex', height: '100%' }}>
        <div style={{ flexGrow: 1, overflow: 'auto'}}>
        <Box
          padding="16px 47px 10px 10px"
          borderBottom="2px solid lightgrey"
        >
          <FormItem label="View" >
            <ViewPicker   viewId={viewId} onChange={option => setViewId(option.value)} />
          </FormItem>
        </Box>
        <Box
           padding="16px 34px 10px 10px"
           display="flex"
           alignItems="center"
        >
          <FormItem label="地图中心">
            <TextInput  style={{  flex: 1}} size="small" value={inputCenter} onChange={ e => setInputcenter(e.target.value)} />
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
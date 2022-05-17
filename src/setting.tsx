import React, { useEffect, useMemo } from 'react';
import { useSettingsButton, useCloudStorage, ViewPicker, FieldPicker, useFields,  } from '@vikadata/widget-sdk';
import { Box, TextInput, Button } from '@vikadata/components';
import style from './setting.module.css';


interface InfolistType{
  text: string,
  value: string,
}

export const Setting: React.FC = () => {
  const [isSettingOpened] = useSettingsButton();
  const [viewId, setViewId] = useCloudStorage<string>('selectedViewId');
  const fields = useFields(viewId);
  

  const [mapCenter, setMapcenter] = useCloudStorage<string>('mapCenter', '深圳市');
  
  // function confirmCenter() {
  //   setMapcenter(inputCenter); 
  // }

  const [infoWindowList, setInfoWindowList] = useCloudStorage<Array<InfolistType>>('infoWindowList', [{ text: '地址', value: ''}, { text: '名称', value: '' }]);

  const [infoWindowListStatus, setInfoWindowListStatus] = useCloudStorage<boolean>('infoWindowListStatus', false);

  const showAddbutton = useMemo(() => {
    return infoWindowList.length >= fields.length
  }, [infoWindowList]);
  
  // const { run } = useDebounceFn(updateInfoList, {  wait: 600, });

  function updateInfoList(index: number, type: string, data: string) {
    let newInfoWindowList = infoWindowList;
    newInfoWindowList[index][type] = data;
    setInfoWindowList([...newInfoWindowList]);
  }

 

  function addInfoWindow() {
    if(showAddbutton) {
      return;
    }
    let newInfoWindowList = infoWindowList;
    newInfoWindowList.push({text: '', value: ''});
    setInfoWindowList([...newInfoWindowList]);
  }

  function deleteInfoWindow() {
    if(infoWindowList.length <= 1) {
      return;
    }
    let newInfoWindowList = infoWindowList;
    newInfoWindowList.length = newInfoWindowList.length - 1;
    setInfoWindowList([...newInfoWindowList]);
  }
  

  function confirmInfoWindow() {
    setInfoWindowListStatus(false);
    let check = true;
    infoWindowList.forEach(formItem => {
      if(formItem.text === '' || formItem.value === '' ) {
        check = false;
      }
    });
    setInfoWindowListStatus(check);
  }

  // useEffect(() => {
  //   confirmInfoWindow();
  // }, []);

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
          {/* <FormItem label="地图中心">
             <TextInput  style={{  width: '100%!important' }} size="small" value={inputCenter} onChange={ e => setInputcenter(e.target.value)} />
            <Button  style={{ marginTop: 8}} color="primary" size="small" onClick={confirmCenter}>
              确定
            </Button>
          </FormItem> */}
        </Box>
        <Box
          padding="30px 10px 60px 10px"
          borderBottom="2px solid lightgrey"
        >
          <h3>设置表格对应得字段和描述</h3>
          {
            infoWindowList.length > 0 ?
              infoWindowList.map((item, index) => {
                return (
                  <div className={style.formItem}>
                    <TextInput 
                      disabled={index === 0 || index === 1}
                      className={style.infoInput}  
                      block size="small"
                      value={item.text}
                      onChange={ e => updateInfoList(index, 'text', e.target.value)}
                    />
                    <FieldPicker  viewId={viewId} fieldId={item.value} onChange={option => updateInfoList(index, 'value', option.value)} />
                  </div>
                )
              }) : null
          }
          <div className={style.buttonContent}>
          { infoWindowList.length > 1 &&
            <Button className={style.marginType} variant="jelly" color="primary" block  onClick={deleteInfoWindow}>删除</Button>
          }
          { !showAddbutton &&
            <Button className={style.marginType} variant="jelly" color="primary" block  onClick={addInfoWindow}>增加</Button>
          }
          <Button className={style.marginType} variant="jelly" color="primary" block  onClick={confirmInfoWindow}>确认</Button>
          </div>
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
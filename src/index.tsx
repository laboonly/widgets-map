import React, { useState, useEffect } from 'react';
import { Box, TextInput, Button } from '@vikadata/components'
import { AddOutlined } from '@vikadata/icons'
import { initializeWidget, useDatasheet, usePrimaryField, useCloudStorage, useRecord,  useField } from '@vikadata/widget-sdk';
import { Setting } from './setting';

export const HelloWorld: React.FC = () => {
  // 表格操作钩子
  const datasheet = useDatasheet();

  // 获取主字段信息
  const primaryField = usePrimaryField();

  // 当前表格选择的视图
  const [viewId, setViewId] = useCloudStorage<string>('selectedViewId');

  /// 当前选择的时长的列
  const [duration, setDuration] = useCloudStorage<string>('selectedDuration');

  // 当前时长列的值
  const [cellValue, setCellValue] = useState<string>();

  // 当前输入框的输入
  const [recordInput, setRecordInput] = useState<string>();
  
  // 当前选择列的title
  const fieldData =  useField(duration)
  


  useEffect(() => {
    console.log('duration',duration)
    
    console.log('fieldData', fieldData)
    setCellValue(fieldData.name)
  }, [duration])

  const showData = () => {
    const fieldsMap = {[primaryField!.id]: recordInput}
    console.log(primaryField!)
    console.log(fieldsMap)
  }


  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flexGrow: 1, overflow: 'auto', padding: '0 8px'}}>
        hello，world 🚀 { cellValue }
        <Box
          paddingX={2}
          paddingY={3}
          display="flex"
          alignItems="center"
        >
          <TextInput style={{flex: 1}} size="small" onChange={e => setRecordInput(e.target.value)}/>
          <Button style={{minWidth: 'fit-content', marginLeft: 8}} prefixIcon={<AddOutlined/>} color="primary" size="small" onClick={showData}>
            show
          </Button>
        </Box>
      </div>
      <Setting />
    </div>
  );
};

initializeWidget(HelloWorld, process.env.WIDGET_PACKAGE_ID);

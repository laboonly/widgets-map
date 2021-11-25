import React from 'react';
import { useSettingsButton, useCloudStorage, ViewPicker, FieldPicker } from '@vikadata/widget-sdk';
import { Box } from '@vikadata/components'

export const Setting: React.FC = () => {
  const [isSettingOpened] = useSettingsButton();
  const [viewId, setViewId] = useCloudStorage<string>('selectedViewId');

  const [duration, setDuration] = useCloudStorage<string>('selectedDuration');

  const [startTime, setStartTime] = useCloudStorage<string>('selectedStartTime');

  const [collaborator, setCollaborator] = useCloudStorage<string>('selectedCollaborator');

  return isSettingOpened ? (
    <div style={{ flexShrink: 0, width: '300px', borderLeft: 'solid 1px gainsboro', paddingLeft: '16px' }}>
      <h1>设置</h1>
      <div style={{ display: 'flex', height: '100%' }}>
        <div style={{ flexGrow: 1, overflow: 'auto'}}>
        <Box
          padding={'16px 10px 10px'}
          borderBottom='2px solid rgba(0, 0, 0, 0.1)'
        >
          <FormItem label="View">
            <ViewPicker viewId={viewId} onChange={option => setViewId(option.value)} />
          </FormItem>
          <FormItem label="持续时间">
            <FieldPicker viewId={viewId} fieldId={duration} onChange={option => setDuration(option.value)} />
          </FormItem>
          <FormItem label="开始时间">
            <FieldPicker viewId={viewId} fieldId={startTime} onChange={option => setStartTime(option.value)} />
          </FormItem>
          <FormItem label="合作者">
            <FieldPicker viewId={viewId} fieldId={collaborator} onChange={option => setCollaborator(option.value)} />
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
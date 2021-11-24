import React from 'react';
import { useSettingsButton } from '@vikadata/widget-sdk';

export const Setting: React.FC = () => {
  const [isSettingOpened] = useSettingsButton();
  return isSettingOpened ? (
    <div style={{ flexShrink: 0, width: '300px', borderLeft: 'solid 1px gainsboro', paddingLeft: '16px' }}>
      this is settings <br />
      点击右上角的齿轮按钮，或者左侧 setting 属性的 toggle 按钮可以看到我的变化
    </div>
  ) : null;
};

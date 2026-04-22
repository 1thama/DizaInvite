import React from 'react';
import NusantaraTemplate from './NusantaraTemplate';
import { NUSANTARA_CONFIGS } from './NusantaraConfigs';

const BugisSacredTemplate = (props: any) => {
  return <NusantaraTemplate {...props} theme={NUSANTARA_CONFIGS.bugis_silk} />;
};

export default BugisSacredTemplate;

import React from 'react';
import NusantaraTemplate from './NusantaraTemplate';
import { NUSANTARA_CONFIGS } from './NusantaraConfigs';

const BatakEthnicTemplate = (props: any) => {
  return <NusantaraTemplate {...props} theme={NUSANTARA_CONFIGS.batak_legacy} />;
};

export default BatakEthnicTemplate;

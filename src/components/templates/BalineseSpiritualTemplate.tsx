import React from 'react';
import NusantaraTemplate from './NusantaraTemplate';
import { NUSANTARA_CONFIGS } from './NusantaraConfigs';

const BalineseSpiritualTemplate = (props: any) => {
  return <NusantaraTemplate {...props} theme={NUSANTARA_CONFIGS.bali_sacred} />;
};

export default BalineseSpiritualTemplate;

import React from 'react';
import NusantaraTemplate from './NusantaraTemplate';
import { NUSANTARA_CONFIGS } from './NusantaraConfigs';

const JavaneseRoyalTemplate = (props: any) => {
  return <NusantaraTemplate {...props} theme={NUSANTARA_CONFIGS.jawa_royal} />;
};

export default JavaneseRoyalTemplate;

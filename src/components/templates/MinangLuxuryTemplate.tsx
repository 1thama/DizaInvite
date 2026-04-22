import React from 'react';
import NusantaraTemplate from './NusantaraTemplate';
import { NUSANTARA_CONFIGS } from './NusantaraConfigs';

const MinangLuxuryTemplate = (props: any) => {
  return <NusantaraTemplate {...props} theme={NUSANTARA_CONFIGS.minang_luxury} />;
};

export default MinangLuxuryTemplate;

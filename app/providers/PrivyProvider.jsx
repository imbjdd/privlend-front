'use client';

import {PrivyProvider} from '@privy-io/react-auth';

export default function Providers({children}) {
  return (
    <PrivyProvider
      appId="cm8hrug4300a4140mgfmni9ag"
      clientId="client-WY5i25gw93zy9rtuAGn8fre6MG245RF2SYhyrecaqKfF1"
      config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: '/next.svg',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
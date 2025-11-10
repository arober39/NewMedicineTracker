// app/_layout.tsx

import { Observability } from '@launchdarkly/observability-react-native';
import { AutoEnvAttributes, LDOptions, LDProvider, ReactNativeLDClient } from '@launchdarkly/react-native-client-sdk';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

const options: LDOptions = {
 applicationInfo: {
   id: 'NewMedicineTracker',
   name: 'New Medicine Tracker',
   version: '1.0.0',
   versionName: 'v1',
 },
 debug: true,
 plugins: [
   new Observability({
     serviceName: 'my-react-native-app',
     serviceVersion: '1.0.0',
   })
 ],
};

const userContext = { kind: 'user', key: 'test-hello' };

export default function RootLayout() {
 const [client, setClient] = useState<ReactNativeLDClient | null>(null);
  useEffect(() => {
   // Initialize client
   const featureClient = new ReactNativeLDClient(
     'mob-abc123',
     AutoEnvAttributes.Enabled,
     options,
   );

   featureClient.identify(userContext).catch((e: any) => console.log(e));
  
   setClient(featureClient);
  
   // Cleanup function that runs when component unmounts
   return () => {
     featureClient.close();
   };
 }, []);

 if (!client) {
   return null;
 }
 return (
   <LDProvider client={client}>
     <Stack />
   </LDProvider>
 );
}

import { Redirect } from 'expo-router';

// "Taramalar" opens the camera (see TabBar); this route only reserves the tab.
export default function ScanTab() {
  return <Redirect href="/tara" />;
}

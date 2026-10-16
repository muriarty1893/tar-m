import { Redirect } from 'expo-router';

// The middle tab is a button that opens the camera (see TabBar); this route only reserves its slot.
export default function ScanTab() {
  return <Redirect href="/tara" />;
}

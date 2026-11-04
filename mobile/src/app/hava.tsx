import { Redirect } from 'expo-router';

/** The weather lives on Takvim now ("Takvim ve hava"); old links land there. */
export default function Weather() {
  return <Redirect href="/takvim" />;
}

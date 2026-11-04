import { Redirect } from 'expo-router';

/** The prices live in Pazar now (İlanlar | Fiyatlar | Mesajlar); old links land there. */
export default function Prices() {
  return <Redirect href={{ pathname: '/pazar', params: { bolum: 'fiyatlar' } }} />;
}

import { Linking, Pressable, View } from 'react-native';

import { BackHeader } from '@/components/app/headers';
import { Screen } from '@/components/app/screen';
import { Text } from '@/components/ui/text';

type Credit = { label: string; author: string; license: string; url?: string };

// Wikimedia Commons photos shared with the website (data/photo-credits.ts); CC BY photos must stay credited.
const CREDITS: Credit[] = [
  { label: "Suşehri'nde buğday tarlası (Sivas)", author: 'Maurice Flesier', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:A_wheat_field_in_Su%C5%9Fehri,_Sivas_Province.jpg' },
  { label: 'Domates mildiyösü', author: 'Natalka Ukraine (baby-bear.org)', license: 'CC BY 4.0', url: 'https://commons.wikimedia.org/wiki/File:Phytophthora_infestans_on_Solanum_lycopersicum_in_Dnipro_by_baby-bear.org.jpg' },
  { label: 'Kuraklıkta mısır', author: 'CraneStation', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Corn_in_drought,_Western_Kentucky,_August,_2012.jpg' },
  { label: 'Ayçiçeği tarlası', author: 'Audrey from Central Pennsylvania, USA', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Sunflower_Field_(7848177492).jpg' },
  { label: 'Ufka uzanan tarla', author: 'John Sutton', license: 'CC BY-SA 2.0', url: 'https://commons.wikimedia.org/wiki/File:Waldringfield,_potato_rows_and_a_cloudless_sky_-_geograph.org.uk_-_7121840.jpg' },
  { label: 'Çimlenen tohumlar', author: 'Aerospectra', license: 'CC BY 4.0', url: 'https://commons.wikimedia.org/wiki/File:Sprouting_seeds.jpg' },
  { label: 'Sarı paslı buğday yaprağı ve buğday tarlası', author: 'Sleek ile tasarım sırasında üretildi', license: 'Proje görseli' },
  { label: 'Solar ikon seti', author: '480 Design', license: 'CC BY 4.0', url: 'https://www.figma.com/community/file/1166831539721848736' },
];

export default function Credits() {
  return (
    <Screen>
      <BackHeader title="Görsel kaynakları" />
      <View className="mx-4 gap-4 rounded-[28px] bg-card p-5">
        {CREDITS.map((c) => (
          <Pressable key={c.label} disabled={!c.url} onPress={() => c.url && Linking.openURL(c.url)} accessibilityRole={c.url ? 'link' : undefined} className="gap-0.5 active:opacity-70">
            <Text className="font-sans-bold text-lg">{c.label}</Text>
            <Text className="text-base text-muted-foreground">
              {c.author} · {c.license}
              {c.url ? ' · kaynağı aç' : ''}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

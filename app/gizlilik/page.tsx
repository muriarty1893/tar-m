import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { ADSENSE_CLIENT } from "@/lib/ads";

export const metadata: Metadata = {
  title: "Gizlilik ve KVKK Aydınlatma Metni",
  description: `${siteConfig.name} web sitesinde toplanan kişisel verilerin işlenmesine ilişkin KVKK aydınlatma metni.`,
};

// DRAFT: written as a starting point only. A lawyer must review it before launch,
// in particular the data-controller details and the cross-border transfer section.

/**
 * ÖRNEK BİLGİLER: the three values below are made up, to be replaced by hand with the real
 * ones (listed in docs/placeholders.md). The company, address and terms are not real.
 */
const PLACEHOLDER = {
  controller: "Çiftçi Destek Bilişim ve Tarım Hizmetleri Ltd. Şti., Yazır Mah. Bosna Hersek Cad. No: 12, 42250 Selçuklu / Konya",
  transfer:
    "Yurt dışına aktarım, KVKK madde 9 uyarınca hizmet sağlayıcılarla imzalanan standart sözleşmelere ve gerektiğinde açık rızanıza dayanılarak yapılır; standart sözleşmeler imzalandıktan sonra beş iş günü içinde Kişisel Verileri Koruma Kurumuna bildirilir.",
  retention:
    "Hesap bilgileri hesabınız açık kaldığı sürece; formlardan gönderdiğiniz mesajlar en fazla 2 yıl; güvenlik ve sunucu kayıtları en fazla 6 ay saklanır.",
};
export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-3 py-3 sm:px-4 sm:py-6">
      <p role="note" className="rounded-md border-l-4 border-gold bg-gold-soft px-3 py-2.5 text-sm font-bold">
        Taslak — hukuki inceleme gereklidir.
      </p>
      <h1 className="mt-3 text-xl font-bold sm:text-2xl">Gizlilik ve KVKK Aydınlatma Metni</h1>

      <div className="prose-article mt-3 space-y-3 rounded-md border border-border bg-card p-4 leading-relaxed sm:p-6">
        <p>
          Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, {siteConfig.name} web sitesi
          üzerinden toplanan kişisel verilerin işlenmesi hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.
        </p>

        <h2>1. Veri sorumlusu</h2>
        <p>
          Veri sorumlusu: {PLACEHOLDER.controller}. İletişim:{" "}
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
        </p>

        <h2>2. İşlenen kişisel veriler</h2>
        <ul>
          <li>Erken erişim formu (artık kullanılmıyor; daha önce kaydolanlar için): ad soyad, e-posta adresi, il ve yetiştirilen ürün (isteğe bağlı).</li>
          <li>İş birliği formu: ad soyad, kurum adı, e-posta adresi, telefon (isteğe bağlı), kurum türü ve mesaj.</li>
          <li>
            Hava durumu bölümü: &quot;Konumumu kullan&quot; seçeneğini kullanırsanız konumunuz yalnızca tarayıcınızda en
            yakın ili bulmak için kullanılır; sunucularımıza gönderilmez ve saklanmaz.
          </li>
          <li>
            Hesap: e-posta adresiniz (ya da Google ile girişte Google hesabınızın adı ve e-postası) ve şifreniz; giriş
            hizmetini sağlayan Clerk tarafından tutulur. Şifreniz bize ulaşmaz.
          </li>
          <li>Profil: diğer kullanıcıların gördüğü adınız ve isteğe bağlı iliniz.</li>
          <li>
            Pazar: ilanlarınız (başlık, fiyat, açıklama, il ve ilçe, fotoğraflar), favorileriniz, şikâyetleriniz ve
            alıcı ya da satıcılarla mesajlarınız ve teklifleriniz. İlanlar ve satıcı adı herkese açıktır; mesajlar
            yalnızca sohbetin iki tarafına görünür. E-posta adresiniz ve telefonunuz ilanlarda gösterilmez.
          </li>
          <li>
            Forum: açtığınız konular, yanıtlarınız, eklediğiniz fotoğraflar ve beğenileriniz; adınız ve kullanıcı adınızla
            herkese açık görünür. Bildirimleriniz yalnızca size görünür.
          </li>
          <li>Tarlalarım ve Tarım takvimi: tarla bilgileriniz, masraflarınız ve takvim işleriniz; yalnızca size görünür.</li>
          <li>Teknik veriler: güvenlik amacıyla, form gönderimlerinde IP adresi geçici olarak kullanılır ve saklanmaz.</li>
          <li>
            Ziyaret istatistikleri: hangi sayfaların açıldığını, ziyaretçinin hangi ülkeden ve hangi siteden geldiğini, cihaz,
            tarayıcı ve işletim sistemi türünü anonim olarak sayarız (Vercel Web Analytics). Çerez kullanılmaz, sizi tanıyan bir
            bilgi saklanmaz ve ziyaretler kişilere bağlanmaz.
          </li>
          {ADSENSE_CLIENT && (
            <li id="reklam">
              Reklamlar: sitede Google AdSense reklamları gösterilir. Google; çerezler ve benzeri teknolojilerle cihaz bilgilerinizi,
              IP adresinizi ve sitedeki gezinmenizi kullanarak reklam gösterir ve ölçer. İzin verirseniz reklamları ilgi alanlarınıza
              göre de seçebilir. İzin vermezseniz reklamlar yine gösterilir, ancak kişiselleştirilmez; Google bu durumda da sıklık
              sınırı, ölçüm ve kötüye kullanımı önleme için çerez kullanabilir. Kararınızı her sayfanın altındaki
              “Reklam tercihleri” bağlantısıyla değiştirebilirsiniz. Google’ın verileri nasıl kullandığı:{" "}
              <a href="https://policies.google.com/technologies/partner-sites?hl=tr" rel="noopener noreferrer" target="_blank">
                policies.google.com
              </a>
              .
            </li>
          )}
        </ul>

        <h2>3. İşleme amaçları</h2>
        <ul>
          <li>Daha önce erken erişim listesine kaydolduysanız, mobil uygulama hazır olduğunda sizi bilgilendirmek,</li>
          <li>İş birliği taleplerinize dönüş yapmak,</li>
          <li>Hesabınızı, ilanlarınızı, mesajlarınızı, tarla ve takvim kayıtlarınızı size sunmak,</li>
          <li>Pazar kurallarına aykırı ilanları ve dolandırıcılığı önlemek,</li>
          <li>Kötüye kullanım ve istenmeyen gönderimleri (spam) önlemek.</li>
        </ul>

        <h2>4. Hukuki sebep</h2>
        <p>
          Kişisel verileriniz, KVKK madde 5/1 kapsamında açık rızanıza ve madde 5/2-f kapsamında meşru menfaatimize
          dayanarak işlenir. Erken erişim formundaki onay kutusu (form artık kullanılmıyor) açık rızanızı ifade eder.
        </p>

        <h2>5. Aktarım</h2>
        <p>
          Hesap bilgileri Clerk Inc. (ABD) tarafından; formlardan gönderdikleriniz (iş birliği mesajları, sorular), ilan,
          mesaj, tarla ve takvim kayıtları Neon (veritabanı) ve ilan fotoğrafları Vercel Blob hizmetinde, Frankfurt (Almanya, AB) bölgesinde
          saklanır. {PLACEHOLDER.transfer} Web sitesi Vercel Inc. altyapısında barındırılmaktadır.
          {ADSENSE_CLIENT && " Reklamla ilgili veriler Google LLC (ABD) ve Google Ireland Ltd. tarafından işlenir."}
        </p>

        <h2>6. Saklama süresi</h2>
        <p>
          Verileriniz, işleme amacı sona erene kadar veya rızanızı geri çekene kadar saklanır; ardından silinir ya da
          anonim hâle getirilir. {PLACEHOLDER.retention} Hesabınızı{" "}
          <a href="/hesabim">Hesabım</a> sayfasından istediğiniz an silebilirsiniz: ilanlarınız, fotoğraflarınız,
          mesajlarınız, tarla ve takvim kayıtlarınız da kalıcı olarak silinir.
        </p>

        <h2>7. Haklarınız</h2>
        <p>KVKK madde 11 uyarınca;</p>
        <ul>
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse bilgi talep etme,</li>
          <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
          <li>Eksik veya yanlış işlenmişse düzeltilmesini, şartları oluştuğunda silinmesini isteme,</li>
          <li>Rızanızı her zaman geri çekme,</li>
          <li>Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
        </ul>
        <p>haklarına sahipsiniz.</p>

        <h2>8. Başvuru</h2>
        <p>
          Haklarınıza ilişkin taleplerinizi <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>{" "}
          adresine iletebilirsiniz. Başvurunuz en geç 30 gün içinde ücretsiz olarak sonuçlandırılır.
        </p>

        <p className="text-base text-muted-foreground">Son güncelleme: 3 Kasım 2026</p>
      </div>
    </article>
  );
}

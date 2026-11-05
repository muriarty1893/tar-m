import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Gizlilik ve KVKK Aydınlatma Metni",
  description: `${siteConfig.name} web sitesinde toplanan kişisel verilerin işlenmesine ilişkin KVKK aydınlatma metni.`,
};

// DRAFT: written as a starting point only. A lawyer must review it before launch,
// in particular the data-controller details and the cross-border transfer section.
export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <p role="note" className="rounded-2xl border-l-4 border-gold bg-gold-soft p-4 font-bold">
        Taslak — hukuki inceleme gereklidir.
      </p>
      <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-5xl">Gizlilik ve KVKK Aydınlatma Metni</h1>

      <div className="prose-article mt-10 space-y-4 rounded-3xl border border-border bg-card p-7 text-lg leading-relaxed shadow-soft sm:p-10">
        <p>
          Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, {siteConfig.name} web sitesi
          üzerinden toplanan kişisel verilerin işlenmesi hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.
        </p>

        <h2>1. Veri sorumlusu</h2>
        <p>
          Veri sorumlusu: [Şirket / kişi adı ve adresi eklenecek]. İletişim:{" "}
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
          Form verileri, kayıt amacıyla Google LLC tarafından sağlanan Google E-Tablolar hizmetinde saklanır. Bu hizmetin
          sunucuları yurt dışında bulunabilir. Hesap bilgileri Clerk Inc. (ABD) tarafından; ilan, mesaj, tarla ve takvim
          kayıtları Neon (veritabanı) ve ilan fotoğrafları Vercel Blob hizmetinde, Frankfurt (Almanya, AB) bölgesinde
          saklanır. [Yurt dışına aktarım için KVKK madde 9 kapsamındaki dayanak ve gerekli bildirimler hukuki inceleme ile
          netleştirilecektir.] Web sitesi Vercel Inc. altyapısında barındırılmaktadır.
        </p>

        <h2>6. Saklama süresi</h2>
        <p>
          Verileriniz, işleme amacı sona erene kadar veya rızanızı geri çekene kadar saklanır; ardından silinir ya da
          anonim hâle getirilir. [Kesin süre belirlenecektir.] Hesabınızı{" "}
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

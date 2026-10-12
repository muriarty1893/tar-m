import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Gizlilik ve KVKK Aydınlatma Metni",
  description: "Bereket AI web sitesinde toplanan kişisel verilerin işlenmesine ilişkin KVKK aydınlatma metni.",
};

// DRAFT: written as a starting point only. A lawyer must review it before launch,
// in particular the data-controller details and the cross-border transfer section.
export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p role="note" className="rounded-xl border-l-4 border-accent bg-accent-soft p-4 font-bold">
        Taslak — hukuki inceleme gereklidir.
      </p>
      <h1 className="mt-8 text-3xl font-extrabold sm:text-4xl">Gizlilik ve KVKK Aydınlatma Metni</h1>

      <div className="prose-article mt-8 space-y-4 text-lg leading-relaxed">
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
          <li>Erken erişim formu: ad soyad, e-posta adresi, il ve yetiştirilen ürün (isteğe bağlı).</li>
          <li>İş birliği formu: ad soyad, kurum adı, e-posta adresi, telefon (isteğe bağlı), kurum türü ve mesaj.</li>
          <li>
            Hava durumu bölümü: &quot;Konumumu kullan&quot; seçeneğini kullanırsanız konumunuz yalnızca tarayıcınızda en
            yakın ili bulmak için kullanılır; sunucularımıza gönderilmez ve saklanmaz.
          </li>
          <li>Teknik veriler: güvenlik amacıyla, form gönderimlerinde IP adresi geçici olarak kullanılır ve saklanmaz.</li>
        </ul>

        <h2>3. İşleme amaçları</h2>
        <ul>
          <li>Uygulama hazır olduğunda sizi bilgilendirmek ve erken erişim daveti göndermek,</li>
          <li>İş birliği taleplerinize dönüş yapmak,</li>
          <li>Kötüye kullanım ve istenmeyen gönderimleri (spam) önlemek.</li>
        </ul>

        <h2>4. Hukuki sebep</h2>
        <p>
          Kişisel verileriniz, KVKK madde 5/1 kapsamında açık rızanıza ve madde 5/2-f kapsamında meşru menfaatimize
          dayanarak işlenir. Erken erişim formundaki onay kutusu açık rızanızı ifade eder.
        </p>

        <h2>5. Aktarım</h2>
        <p>
          Form verileri, kayıt amacıyla Google LLC tarafından sağlanan Google E-Tablolar hizmetinde saklanır. Bu hizmetin
          sunucuları yurt dışında bulunabilir. [Yurt dışına aktarım için KVKK madde 9 kapsamındaki dayanak ve gerekli
          bildirimler hukuki inceleme ile netleştirilecektir.] Web sitesi Vercel Inc. altyapısında barındırılmaktadır.
        </p>

        <h2>6. Saklama süresi</h2>
        <p>
          Verileriniz, işleme amacı sona erene kadar veya rızanızı geri çekene kadar saklanır; ardından silinir ya da
          anonim hâle getirilir. [Kesin süre belirlenecektir.]
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

        <p className="text-base text-muted">Son güncelleme: 12 Ekim 2026</p>
      </div>
    </article>
  );
}

import { PageHeader } from "@/components/layout/page-header";
import { Info, Heart, Search, Star, Briefcase, UserRound, ImagePlus, Bell, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Információk – Esküvőre Készülök",
};

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2.5">
        <Icon className="h-6 w-6 text-[#84AAA6] shrink-0" strokeWidth={1.5} />
        {title}
      </h2>
      {children}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4 items-start">
      <div className="w-10 h-10 rounded-lg bg-[#84AAA6]/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-[#84AAA6]" strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-base text-gray-600">{description}</p>
      </div>
    </div>
  );
}

export default function InformaciokPage() {
  return (
    <div>
      <PageHeader icon={Info} title="Információk" description="Tudj meg mindent az Esküvőre Készülök platformról – miért jött létre, és mit kínál számodra." />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Miért jött létre */}
        <Section icon={Heart} title="Miért jött létre ez az oldal?">
          <div className="bg-[#F0F6F5] border border-[#84AAA6]/20 rounded-2xl p-6 mb-4">
            <p className="text-gray-900 text-base leading-relaxed mb-3">
              Az esküvő szervezése életünk egyik legizgalmasabb, ugyanakkor legbonyolultabb feladatai közé tartozik. Rengeteg szakemberre van szükség – fotóstól, zenészen és vőfélyen át a virágkötőig, tortakészítőig és helyszínig –, akiket általában szájhagyomány útján, ismerősök ajánlásával, vagy hosszas internetes keresgéléssel szoktak megtalálni.
            </p>
            <p className="text-gray-900 text-base leading-relaxed">
              Az <strong>Esküvőre Készülök</strong> célja, hogy ezt a folyamatot leegyszerűsítse: egy helyen gyűjti össze a megbízható esküvői szolgáltatókat, lehetővé teszi az értékelések olvasását, és megkönnyíti a kapcsolatfelvételt – legyen szó leendő menyasszonyokról, vőlegényekről vagy a szülőkről, akik segíteni szeretnének.
            </p>
          </div>
        </Section>

        <hr className="border-gray-200 mb-10" />

        {/* Látogatóknak */}
        <Section icon={Search} title="Látogatóknak – mit tehetsz az oldalon?">
          <p className="text-gray-600 text-base mb-5">
            Ha esküvőre készülsz és a legjobb szakembereket keresed, az alábbi funkciók állnak rendelkezésedre:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <FeatureCard
              icon={Search}
              title="Böngészés kategóriák szerint"
              description="20 kategóriában találsz szakembereket – fotósoktól kezdve a helyszíneken át a kozmetikusokig."
            />
            <FeatureCard
              icon={Star}
              title="Értékelések olvasása és írása"
              description="Bejelentkezett látogatóként csillagos értékelést és szöveges véleményt írhatsz a szolgáltatókról."
            />
            <FeatureCard
              icon={Heart}
              title="Kedvencek mentése"
              description="Jelöld kedvencnek a tetsző szolgáltatókat, és a profilodban bármikor visszanézheted őket."
            />
            <FeatureCard
              icon={UserRound}
              title="Ingyenes regisztráció"
              description="Látogatói fiók létrehozása ingyenes, és megnyitja az értékelési és kedvenc-jelölési funkciókat."
            />
          </div>
        </Section>

        <hr className="border-gray-200 mb-10" />

        {/* Szolgáltatóknak */}
        <Section icon={Briefcase} title="Szolgáltatóknak – mit tehetsz az oldalon?">
          <p className="text-gray-600 text-base mb-5">
            Ha esküvői szakember vagy és szeretnéd, hogy megtaláljanak a párok, az alábbiak várnak rád:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <FeatureCard
              icon={UserRound}
              title="Ingyenes szolgáltatói profil"
              description="Hozz létre profilod, add meg elérhetőségeidet, mutatkozz be röviden, és jelöld meg a tevékenységi területeidet."
            />
            <FeatureCard
              icon={ImagePlus}
              title="Képgaléria feltöltése"
              description="Töltsd fel munkáid fotóit, hogy a látogatók képet kapjanak a stílusodról és minőségedről."
            />
            <FeatureCard
              icon={Bell}
              title="Belső üzenetküldő"
              description="Az érdeklődő látogatók közvetlenül üzenhetnek neked az oldalon keresztül, amelyre te is válaszolhatsz."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Adminisztrátori jóváhagyás"
              description="A profilok megjelenés előtt moderáción esnek át, így a listán csak valódi, megbízható szakemberek szerepelnek."
            />
          </div>
        </Section>

        <hr className="border-gray-200 mb-10" />

        {/* CTA */}
        <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: "#F0F6F5" }}>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Készen állsz?</h2>
          <p className="text-gray-600 text-base mb-6">Böngészd az elérhető szolgáltatókat, vagy regisztrálj te is!</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/services">
              <Button size="lg" className="w-full sm:w-auto">Megnézem a kategóriákat</Button>
            </Link>
            <Link href="/auth/register?type=provider">
              <Button size="lg" className="w-full sm:w-auto bg-transparent text-[#C65EA5] border border-[#C65EA5] hover:bg-[#C65EA5] hover:text-white">
                Regisztrálok szolgáltatónak
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

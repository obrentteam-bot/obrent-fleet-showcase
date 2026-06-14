import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/impressum")({
  head: () => ({
    meta: [
      { title: "Impressum — OBRENT" },
      { name: "description", content: "Impressum und rechtliche Angaben der OBRENT GmbH gemäß § 5 DDG." },
      { property: "og:title", content: "Impressum — OBRENT" },
      { property: "og:description", content: "Impressum der OBRENT GmbH." },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: ImpressumPage,
});

function ImpressumPage() {
  return (
    <SiteLayout>
      <section className="pt-40 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="gold-rule" />
            <span className="eyebrow">Rechtliches</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl text-cream leading-[0.95] mb-12">
            Impressum
          </h1>

          <div className="space-y-10 text-cream/75 font-light leading-relaxed">
            <div>
              <h2 className="font-display text-2xl text-cream mb-3">Angaben gemäß § 5 DDG</h2>
              <p>
                OBRENT GmbH<br />
                Industriestraße 60<br />
                67063 Ludwigshafen am Rhein<br />
                Deutschland
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">Vertreten durch</h2>
              <p>Geschäftsführer: Osman Boyraz</p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">Kontakt</h2>
              <p>
                E-Mail: info@obrent.de<br />
                Telefon: +49 15569 459633
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">Registereintrag</h2>
              <p>
                Eintragung im Handelsregister<br />
                Registergericht: Amtsgericht Mannheim<br />
                Registernummer: HRB [wird nachgereicht]
              </p>
              <p className="mt-2 text-xs text-cream/50">
                Angaben werden nach Handelsregistereintragung ergänzt.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">Umsatzsteuer-ID</h2>
              <p>
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                USt-IdNr.: [wird nachgereicht]
              </p>
              <p className="mt-2 text-xs text-cream/50">
                Angaben werden nach Handelsregistereintragung ergänzt.
              </p>
            </div>


            <div>
              <h2 className="font-display text-2xl text-cream mb-3">
                Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
              </h2>
              <p>
                Osman Boyraz<br />
                Industriestraße 60<br />
                67063 Ludwigshafen am Rhein
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">EU-Streitschlichtung</h2>
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:underline"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
                . Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">
                Verbraucherstreitbeilegung / Universalschlichtungsstelle
              </h2>
              <p>
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">Haftung für Inhalte</h2>
              <p>
                Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach
                den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als
                Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
                Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
                Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
                Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">Haftung für Links</h2>
              <p>
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
                Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr
                übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder
                Betreiber der Seiten verantwortlich.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">Urheberrecht</h2>
              <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
                dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
                der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
                Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

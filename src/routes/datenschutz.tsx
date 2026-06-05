import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/datenschutz")({
  head: () => ({
    meta: [
      { title: "Datenschutzerklärung — OBRENT" },
      { name: "description", content: "Informationen zur Verarbeitung personenbezogener Daten bei OBRENT gemäß DSGVO." },
      { property: "og:title", content: "Datenschutzerklärung — OBRENT" },
      { property: "og:description", content: "Datenschutzerklärung der OBRENT GmbH." },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: DatenschutzPage,
});

function DatenschutzPage() {
  return (
    <SiteLayout>
      <section className="pt-40 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="gold-rule" />
            <span className="eyebrow">Rechtliches</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl text-cream leading-[0.95] mb-12">
            Datenschutz&shy;erklärung
          </h1>

          <div className="space-y-10 text-cream/75 font-light leading-relaxed">
            <div>
              <h2 className="font-display text-2xl text-cream mb-3">1. Verantwortlicher</h2>
              <p>
                Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              </p>
              <p className="mt-3">
                OBRENT GmbH<br />
                vertreten durch den Geschäftsführer Osman Boyraz<br />
                Industriestraße 60<br />
                67063 Ludwigshafen am Rhein<br />
                Deutschland<br />
                E-Mail: concierge@obrent.com
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">2. Allgemeine Hinweise</h2>
              <p>
                Wir nehmen den Schutz Ihrer personenbezogenen Daten sehr ernst. Wir behandeln Ihre
                personenbezogenen Daten vertraulich und entsprechend der gesetzlichen
                Datenschutzvorschriften (insbesondere DSGVO und BDSG) sowie dieser
                Datenschutzerklärung.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">
                3. Erhebung und Speicherung personenbezogener Daten
              </h2>
              <p>
                <strong className="text-cream">a) Beim Besuch der Website:</strong> Beim Aufrufen unserer
                Website werden durch den auf Ihrem Endgerät zum Einsatz kommenden Browser automatisch
                Informationen an den Server unserer Website gesendet (sog. Server-Logfiles). Diese
                Informationen umfassen u. a. IP-Adresse, Datum und Uhrzeit der Anfrage, Zeitzonendifferenz,
                Inhalt der Anforderung, Zugriffsstatus, übertragene Datenmenge, Referrer-URL, verwendeter
                Browser und Betriebssystem. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
                Interesse an einer technisch fehlerfreien Darstellung).
              </p>
              <p className="mt-3">
                <strong className="text-cream">b) Bei Nutzung des Kontaktformulars:</strong> Bei Fragen
                bieten wir Ihnen die Möglichkeit, mit uns über ein Formular sowie per E-Mail Kontakt
                aufzunehmen. Dabei verarbeiten wir die von Ihnen angegebenen Daten (Name, E-Mail-Adresse,
                Telefonnummer, Nachricht) zur Bearbeitung Ihrer Anfrage. Rechtsgrundlage ist Art. 6 Abs. 1
                lit. b DSGVO (Vertragsanbahnung) bzw. Art. 6 Abs. 1 lit. f DSGVO.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">4. Weitergabe von Daten</h2>
              <p>
                Eine Übermittlung Ihrer personenbezogenen Daten an Dritte zu anderen als den im Folgenden
                genannten Zwecken findet nicht statt. Wir geben Ihre Daten nur weiter, wenn Sie Ihre
                ausdrückliche Einwilligung erteilt haben (Art. 6 Abs. 1 lit. a DSGVO), die Weitergabe zur
                Vertragserfüllung erforderlich ist (Art. 6 Abs. 1 lit. b DSGVO) oder eine gesetzliche
                Verpflichtung besteht (Art. 6 Abs. 1 lit. c DSGVO).
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">5. Cookies</h2>
              <p>
                Unsere Website verwendet technisch notwendige Cookies, um die Nutzung bestimmter
                Funktionen zu ermöglichen. Rechtsgrundlage ist § 25 Abs. 2 TDDDG i. V. m. Art. 6 Abs. 1
                lit. f DSGVO. Sie können Ihren Browser so einstellen, dass Sie über das Setzen von
                Cookies informiert werden und Cookies einzeln zulassen oder generell ausschließen.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">6. Speicherdauer</h2>
              <p>
                Wir verarbeiten und speichern Ihre personenbezogenen Daten nur so lange, wie es für die
                Erfüllung des jeweiligen Zwecks erforderlich ist oder gesetzliche Aufbewahrungsfristen
                (insbesondere handels- und steuerrechtliche Pflichten von bis zu 10 Jahren) es vorsehen.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">7. Ihre Rechte</h2>
              <p>Sie haben gegenüber uns folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:</p>
              <ul className="list-disc pl-6 mt-3 space-y-1">
                <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
                <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
                <li>Recht auf Löschung (Art. 17 DSGVO)</li>
                <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Recht auf Widerspruch (Art. 21 DSGVO)</li>
                <li>Recht auf Widerruf einer Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
                <li>Recht auf Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">8. SSL-Verschlüsselung</h2>
              <p>
                Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher
                Inhalte eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie
                an der Adresszeile des Browsers (https:// statt http://).
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">9. Hosting</h2>
              <p>
                Unsere Website wird bei einem externen Dienstleister gehostet. Personenbezogene Daten,
                die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert.
                Mit dem Hoster besteht ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">10. Aktualität dieser Erklärung</h2>
              <p>
                Diese Datenschutzerklärung ist aktuell gültig. Durch die Weiterentwicklung unserer
                Website oder geänderte gesetzliche bzw. behördliche Vorgaben kann es notwendig werden,
                diese Datenschutzerklärung zu ändern.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

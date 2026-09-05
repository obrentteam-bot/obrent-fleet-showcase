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
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-cream leading-[0.95] mb-12 break-words">
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
                vertreten durch den Geschäftsführer Ali Boyraz<br />
                Industriestraße 60<br />
                67063 Ludwigshafen am Rhein<br />
                Deutschland<br />
                E-Mail: <a href="mailto:info@obrent.de" className="text-gold hover:underline">info@obrent.de</a>
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">2. Zweck der Datenerhebung</h2>
              <p>
                Zur Durchführung von Mietanfragen, Reservierungen, Mietverträgen, Fahrzeugübergaben,
                Fahrzeugrückgaben, Schadensabwicklungen, Zahlungsabwicklungen und gesetzlichen
                Verpflichtungen verarbeitet OBRENT personenbezogene Daten seiner Kunden.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">3. Erhobene Daten</h2>
              <p>
                Im Rahmen der Fahrzeugvermietung können insbesondere folgende Daten erhoben und
                verarbeitet werden:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-1">
                <li>Vor- und Nachname</li>
                <li>Anschrift</li>
                <li>Geburtsdatum</li>
                <li>Telefonnummer</li>
                <li>E-Mail-Adresse</li>
                <li>Personalausweisdaten</li>
                <li>Führerscheindaten</li>
                <li>Zahlungsdaten</li>
                <li>Kautionsdaten</li>
                <li>Fahrzeugbezogene Vertragsdaten</li>
                <li>Schadens- und Unfallinformationen</li>
              </ul>
              <p className="mt-3">
                Soweit erforderlich können auch Kopien oder digitale Abbildungen von Personalausweisen,
                Reisepässen, Führerscheinen sowie weiteren Identitätsnachweisen verarbeitet werden,
                sofern dies zur Identitätsprüfung, Betrugsprävention, Vertragsdurchführung oder
                Beweissicherung erforderlich ist.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">
                4. Rechtsgrundlage der Verarbeitung
              </h2>
              <p>
                Die Verarbeitung erfolgt gemäß Art. 6 Abs. 1 lit. b DSGVO zur Durchführung
                vorvertraglicher Maßnahmen und zur Erfüllung des Mietvertrages. Soweit gesetzliche
                Aufbewahrungs- oder Nachweispflichten bestehen, erfolgt die Verarbeitung zusätzlich
                auf Grundlage von Art. 6 Abs. 1 lit. c DSGVO.
              </p>
              <p className="mt-3">
                Die Verarbeitung von Standortdaten (GPS-Ortung) erfolgt auf Grundlage von Art. 6
                Abs. 1 lit. f DSGVO (berechtigtes Interesse). Das berechtigte Interesse besteht im
                Schutz der Fahrzeuge vor Diebstahl, der Wiederbeschaffung entwendeter Fahrzeuge,
                der Verhinderung von Missbrauch sowie der Durchsetzung vertraglicher Ansprüche.
              </p>
              <p className="mt-3">
                <strong className="text-cream">Beim Besuch der Website:</strong> Beim Aufrufen unserer
                Website werden durch den auf Ihrem Endgerät zum Einsatz kommenden Browser automatisch
                Informationen an den Server unserer Website gesendet (sog. Server-Logfiles), u. a.
                IP-Adresse, Datum und Uhrzeit der Anfrage, Browser und Betriebssystem. Rechtsgrundlage
                ist Art. 6 Abs. 1 lit. f DSGVO. <strong className="text-cream">Bei Nutzung des
                Kontaktformulars</strong> verarbeiten wir die von Ihnen angegebenen Daten zur
                Bearbeitung Ihrer Anfrage (Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO).
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">5. Weitergabe von Daten</h2>
              <p>
                Eine Weitergabe personenbezogener Daten erfolgt ausschließlich soweit dies
                erforderlich ist, insbesondere an:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-1">
                <li>Versicherungen</li>
                <li>Rechtsanwälte</li>
                <li>Steuerberater</li>
                <li>Inkassodienstleister</li>
                <li>Behörden</li>
                <li>Polizei</li>
                <li>Gerichte</li>
                <li>Zahlungsdienstleister</li>
              </ul>
              <p className="mt-3">
                Dies gilt insbesondere bei Schadensfällen, Verkehrsverstößen, Bußgeldern oder
                gesetzlichen Verpflichtungen. Darüber hinaus können externe Dienstleister im Rahmen
                einer gesetzlichen oder vertraglich zulässigen Auftragsverarbeitung eingesetzt werden,
                insbesondere für Buchhaltung, IT-Dienstleistungen, Cloud-Speicherung,
                E-Mail-Kommunikation, GPS-Ortungssysteme und Zahlungsabwicklung. Soweit gesetzlich
                erforderlich bestehen mit diesen Dienstleistern Auftragsverarbeitungsverträge gemäß
                Art. 28 DSGVO.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">6. GPS-Ortung</h2>
              <p>
                Zum Schutz der Fahrzeuge können diese mit Ortungs- oder Diebstahlschutzsystemen
                ausgestattet sein. Eine Verarbeitung von Standortdaten erfolgt ausschließlich:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-1">
                <li>zur Diebstahlprävention</li>
                <li>zur Wiederbeschaffung gestohlener Fahrzeuge</li>
                <li>bei erheblichen Vertragsverstößen</li>
                <li>bei verspäteter Rückgabe</li>
                <li>zum Schutz berechtigter Interessen des Vermieters</li>
              </ul>
              <p className="mt-3">Eine permanente Überwachung des Mieters findet nicht statt.</p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">7. Speicherdauer</h2>
              <p>
                Personenbezogene Daten werden nur so lange gespeichert, wie dies zur
                Vertragsdurchführung, Schadensbearbeitung oder aufgrund gesetzlicher
                Aufbewahrungspflichten erforderlich ist. Steuer- und handelsrechtliche Unterlagen
                können entsprechend der gesetzlichen Vorgaben bis zu zehn Jahre aufbewahrt werden.
              </p>
              <p className="mt-3">
                Ausweis- und Führerscheindaten werden nur so lange gespeichert, wie dies zur
                Vertragsdurchführung, Betrugsprävention, Beweissicherung oder aufgrund gesetzlicher
                Verpflichtungen erforderlich ist.
              </p>
              <p className="mt-3">
                Standortdaten aus Ortungssystemen werden ausschließlich anlassbezogen verarbeitet und
                nicht dauerhaft zur Verhaltensüberwachung des Mieters gespeichert.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">8. Rechte der betroffenen Personen</h2>
              <p>Sie haben gegenüber uns folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:</p>
              <ul className="list-disc pl-6 mt-3 space-y-1">
                <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
                <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
                <li>Recht auf Löschung (Art. 17 DSGVO)</li>
                <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Recht auf Widerspruch (Art. 21 DSGVO)</li>
                <li>Recht auf Widerruf einer Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
              </ul>
              <p className="mt-3">
                Soweit gesetzliche Aufbewahrungspflichten bestehen, können diese Rechte eingeschränkt
                sein.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">9. Beschwerderecht</h2>
              <p>
                Betroffene Personen haben das Recht, sich bei einer zuständigen
                Datenschutzaufsichtsbehörde zu beschweren. Für Rheinland-Pfalz ist dies:
              </p>
              <p className="mt-3">
                Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit
                Rheinland-Pfalz.
              </p>
              <p className="mt-3">
                Datenschutzanfragen können an <a href="mailto:info@obrent.de" className="text-gold hover:underline">info@obrent.de</a> gerichtet werden.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">10. SSL-Verschlüsselung</h2>
              <p>
                Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher
                Inhalte eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen
                Sie an der Adresszeile des Browsers (https:// statt http://).
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">11. Hosting</h2>
              <p>
                Unsere Website wird bei einem externen Dienstleister gehostet. Personenbezogene Daten,
                die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert.
                Mit dem Hoster besteht ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-cream mb-3">12. Schlussbestimmungen</h2>
              <p>
                Diese Datenschutzerklärung gilt für sämtliche Vertragsverhältnisse zwischen OBRENT
                und seinen Kunden im Bereich Fahrzeugvermietung.
              </p>
              <p className="mt-3 text-cream/55 text-sm">Stand: Juni 2026</p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

import { EmailLayout } from "./email-layout";

interface ProviderApprovedEmailProps {
  name: string;
}

export function ProviderApprovedEmail({ name }: ProviderApprovedEmailProps) {
  return (
    <EmailLayout
      preview="Profilod jóváhagyásra került – mostantól látható a látogatók számára!"
      title="Profilod jóváhagyásra került! ✅"
      subtitle="Mostantól megtalálnak téged a leendő párok."
    >
      <p style={s.text}>Kedves {name},</p>

      <p style={s.text}>
        Örömmel értesítünk, hogy szolgáltatói profilod az{" "}
        <strong>Esküvőre Készülök</strong> oldalon{" "}
        <strong>jóváhagyásra került</strong>, és mostantól látható az oldalon
        böngésző párok számára.
      </p>

      <p style={s.text}>
        A profilodon megjelenik az összes megadott adatod, képeid és
        elérhetőségeid. Az érdeklődő párok közvetlenül rajtad keresztül
        tudnak ajánlatkérést küldeni.
      </p>

      {/* CTA gomb */}
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "28px auto" }}>
        <tr>
          <td style={s.btnCell}>
            <a href="https://eskuvorekeszulok.hu/profil" style={s.btn}>
              Profil megtekintése
            </a>
          </td>
        </tr>
      </table>

      <p style={s.mutedText}>
        Ha kérdésed van, keress minket a{" "}
        <a href="mailto:info@eskuvorekeszulok.hu" style={s.link}>
          info@eskuvorekeszulok.hu
        </a>{" "}
        címen.
      </p>
    </EmailLayout>
  );
}

ProviderApprovedEmail.defaultProps = { name: "Minta Szolgáltató" };

const s = {
  text: {
    margin: "0 0 16px 0",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "16px",
    color: "#404040",
    lineHeight: "1.6",
  } as React.CSSProperties,
  mutedText: {
    margin: "0 0 8px 0",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "14px",
    color: "#888888",
    lineHeight: "1.6",
  } as React.CSSProperties,
  btnCell: {
    backgroundColor: "#84AAA6",
    borderRadius: "8px",
  },
  btn: {
    display: "inline-block",
    padding: "14px 32px",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "16px",
    fontWeight: 700,
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: "8px",
  } as React.CSSProperties,
  link: {
    color: "#84AAA6",
    textDecoration: "underline",
  },
} as const;

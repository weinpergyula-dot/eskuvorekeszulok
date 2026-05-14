import { EmailLayout } from "./email-layout";

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <EmailLayout
      preview={`Üdvözlünk, ${name}! Regisztrációd sikeres volt.`}
      iconChar="♥"
      title="Üdvözlünk az Esküvőre Készülőn!"
      subtitle="Örömmel üdvözlünk a közösségünkben."
    >
      <p style={s.text}>Kedves {name},</p>

      <p style={s.text}>
        Regisztrációd sikeresen megtörtént az <strong>Esküvőre Készülök</strong> oldalon!
        Mostantól böngészheted az esküvői szakemberek és helyszínek széles kínálatát,
        jelölheted kedvenceidet, és ajánlatkérést küldhetsz nekik.
      </p>

      {/* CTA gomb */}
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "28px auto" }}>
        <tr>
          <td style={s.btnCell}>
            <a href="https://eskuvorekeszulok.hu/services" style={s.btn}>
              Szolgáltatók böngészése
            </a>
          </td>
        </tr>
      </table>

      <p style={s.mutedText}>
        Ha kérdésed van, keress minket a weboldalon lévő{" "}
        <a href="https://www.eskuvorekeszulok.hu/kapcsolat" style={s.link}>
          Kapcsolat
        </a>{" "}
        menüpont alatt.
      </p>
    </EmailLayout>
  );
}

WelcomeEmail.defaultProps = { name: "Minta Felhasználó" };

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

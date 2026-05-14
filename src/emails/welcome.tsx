import { EmailLayout } from "./email-layout";

interface WelcomeEmailProps {
  name: string;
}

// Szív ikon — fehér (teal háttéren)
const ICON_WHITE_HEART =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='white' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'/%3E%3C/svg%3E";

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <EmailLayout
      preview={`Üdvözlünk, ${name}! Regisztrációd sikeres volt.`}
      iconSrc={ICON_WHITE_HEART}
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
        Ha kérdésed van, bármikor elérsz minket az{" "}
        <a href="mailto:info@eskuvorekeszulok.hu" style={s.link}>
          info@eskuvorekeszulok.hu
        </a>{" "}
        címen.
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

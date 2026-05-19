import { EmailLayout } from "./email-layout";

interface ConfirmEmailProps {
  confirmLink: string;
  name?: string;
}

export function ConfirmEmail({ confirmLink, name }: ConfirmEmailProps) {
  return (
    <EmailLayout
      preview="Erősítsd meg az e-mail címedet – Esküvőre Készülök"
      iconChar="✉"
      title="Erősítsd meg az e-mail címedet!"
      subtitle="Már csak egy lépés, hogy aktiváld a fiókodat."
    >
      <p style={s.text}>
        {name ? `Kedves ${name},` : "Kedves felhasználó,"}
      </p>

      <p style={s.text}>
        Köszönjük, hogy regisztráltál az <strong>Esküvőre Készülök</strong> oldalon!
        Kattints az alábbi gombra az e-mail címed megerősítéséhez és a fiókok aktiválásához:
      </p>

      {/* CTA gomb */}
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "28px auto" }}>
        <tr>
          <td style={s.btnCell}>
            <a href={confirmLink} style={s.btn}>
              E-mail cím megerősítése
            </a>
          </td>
        </tr>
      </table>

      <p style={s.mutedText}>
        Ha a gomb nem működik, másold be ezt a linket a böngésződbe:
      </p>
      <p style={s.linkText}>
        <a href={confirmLink} style={s.link}>{confirmLink}</a>
      </p>

      <p style={s.mutedText}>
        Ha nem te regisztráltál erre az oldalra, ezt az e-mailt figyelmen kívül hagyhatod.
      </p>
    </EmailLayout>
  );
}

ConfirmEmail.defaultProps = {
  confirmLink: "https://www.eskuvorekeszulok.hu/auth/callback",
  name: undefined,
};

const s = {
  text: {
    margin: "0 0 16px 0",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "16px",
    color: "#404040",
    lineHeight: "1.6",
  } as React.CSSProperties,
  mutedText: {
    margin: "16px 0 4px 0",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "14px",
    color: "#888888",
    lineHeight: "1.6",
  } as React.CSSProperties,
  linkText: {
    margin: "0 0 8px 0",
    wordBreak: "break-all" as const,
  },
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
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "13px",
  },
} as const;

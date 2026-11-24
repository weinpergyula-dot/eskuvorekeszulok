import { EmailLayout } from "./email-layout";

interface ResetPasswordEmailProps {
  resetLink: string;
}

export function ResetPasswordEmail({ resetLink }: ResetPasswordEmailProps) {
  return (
    <EmailLayout
      preview="Jelszó visszaállítási link – Esküvőre Készülök"
      iconChar="✦"
      title="Jelszó visszaállítása"
      subtitle="Kattints a gombra az új jelszavad megadásához."
    >
      <p style={s.text}>
        Jelszó visszaállítást kértél az <strong>Esküvőre Készülök</strong> fiókodhoz.
        Kattints az alábbi gombra az új jelszavad megadásához:
      </p>

      {/* CTA gomb */}
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "28px auto" }}>
        <tr>
          <td style={s.btnCell}>
            <a href={resetLink} style={s.btn}>
              Jelszó visszaállítása
            </a>
          </td>
        </tr>
      </table>

      <p style={s.mutedText}>
        Ha a gomb nem működik, másold be ezt a linket a böngésződbe:
      </p>
      <p style={s.linkText}>
        <a href={resetLink} style={s.link}>{resetLink}</a>
      </p>

      <p style={s.mutedText}>
        A link <strong>1 óráig</strong> érvényes. Ha nem te kérted a visszaállítást,
        ezt az e-mailt figyelmen kívül hagyhatod.
      </p>
    </EmailLayout>
  );
}

ResetPasswordEmail.defaultProps = {
  resetLink: "https://www.eskuvorekeszulok.hu/auth/reset-password",
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

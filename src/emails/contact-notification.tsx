import { EmailLayout } from "./email-layout";

interface ContactNotificationEmailProps {
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  messagePreview: string;
  ctaUrl: string;
}

export function ContactNotificationEmail({
  senderName,
  senderEmail,
  senderPhone,
  messagePreview,
  ctaUrl,
}: ContactNotificationEmailProps) {
  return (
    <EmailLayout
      preview={`Új kapcsolatfelvételi üzenet: ${senderName} – Esküvőre Készülök`}
      iconChar="✉"
      title="Új kapcsolatfelvételi üzenet"
      subtitle="Valaki üzenetet küldött a kapcsolati oldalon."
    >
      <p style={s.text}>Kedves Admin,</p>

      <p style={s.text}>
        Új üzenet érkezett a <strong>Kapcsolat</strong> oldalon keresztül:
      </p>

      <div style={s.highlight}>
        <p style={s.label}>Feladó neve</p>
        <p style={s.value}>{senderName}</p>
        <p style={s.label}>E-mail cím</p>
        <p style={s.value}>{senderEmail}</p>
        {senderPhone && (
          <>
            <p style={s.label}>Telefonszám</p>
            <p style={s.value}>{senderPhone}</p>
          </>
        )}
        <p style={s.label}>Üzenet</p>
        <p style={{ ...s.value, fontStyle: "italic" }}>&ldquo;{messagePreview}&rdquo;</p>
      </div>

      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "28px auto" }}>
        <tr>
          <td style={s.btnCell}>
            <a href={ctaUrl} style={s.btn}>
              Admin felületen megtekintés
            </a>
          </td>
        </tr>
      </table>
    </EmailLayout>
  );
}

ContactNotificationEmail.defaultProps = {
  senderName: "Névtelen",
  senderEmail: "",
  senderPhone: undefined,
  messagePreview: "",
  ctaUrl: "https://www.eskuvorekeszulok.hu/admin",
};

const s = {
  text: {
    margin: "0 0 16px 0",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "16px",
    color: "#404040",
    lineHeight: "1.6",
  } as React.CSSProperties,
  highlight: {
    background: "#F5F9F9",
    border: "1px solid #C8DCDA",
    borderRadius: "8px",
    padding: "14px 16px",
    margin: "0 0 20px 0",
  },
  label: {
    margin: "8px 0 2px 0",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "12px",
    color: "#888888",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  } as React.CSSProperties,
  value: {
    margin: "0 0 6px 0",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "15px",
    color: "#404040",
    lineHeight: "1.5",
  } as React.CSSProperties,
  btnCell: { backgroundColor: "#84AAA6", borderRadius: "8px" },
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
} as const;

import { EmailLayout } from "./email-layout";

interface NewMessageEmailProps {
  recipientName?: string;
  senderName: string;
  subject: string;
  ctaUrl: string;
}

export function NewMessageEmail({ recipientName, senderName, subject, ctaUrl }: NewMessageEmailProps) {
  return (
    <EmailLayout
      preview={`${senderName} üzenetet küldött neked – Esküvőre Készülök`}
      iconChar="✉"
      title="Új üzeneted érkezett"
      subtitle="Valaki üzenetet küldött neked az Esküvőre Készülök oldalon."
    >
      <p style={s.text}>
        {recipientName ? `Kedves ${recipientName},` : "Kedves felhasználó,"}
      </p>

      <p style={s.text}>
        <strong>{senderName}</strong> üzenetet küldött neked a következő tárggyal:
      </p>

      <div style={s.highlight}>
        <p style={s.highlightText}>{subject}</p>
      </div>

      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "28px auto" }}>
        <tr>
          <td style={s.btnCell}>
            <a href={ctaUrl} style={s.btn}>
              Üzenet megtekintése
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

NewMessageEmail.defaultProps = {
  recipientName: undefined,
  senderName: "Valaki",
  subject: "Üzenet",
  ctaUrl: "https://www.eskuvorekeszulok.hu/profil#messages",
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
    padding: "12px 16px",
    margin: "0 0 20px 0",
  },
  highlightText: {
    margin: 0,
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "15px",
    color: "#404040",
    fontStyle: "italic",
  } as React.CSSProperties,
  mutedText: {
    margin: "16px 0 4px 0",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "14px",
    color: "#888888",
    lineHeight: "1.6",
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
  link: { color: "#84AAA6", textDecoration: "underline" },
} as const;

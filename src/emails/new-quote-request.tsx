import { EmailLayout } from "./email-layout";

interface NewQuoteRequestEmailProps {
  providerName?: string;
  visitorName: string;
  subject: string;
  category: string;
  messagePreview: string;
  ctaUrl: string;
}

export function NewQuoteRequestEmail({
  providerName,
  visitorName,
  subject,
  category,
  messagePreview,
  ctaUrl,
}: NewQuoteRequestEmailProps) {
  return (
    <EmailLayout
      preview={`${visitorName} ajánlatkérést küldött neked – Esküvőre Készülök`}
      iconChar="✦"
      title="Új ajánlatkérés érkezett"
      subtitle="Egy látogató ajánlatkérést küldött a profilodra."
    >
      <p style={s.text}>
        {providerName ? `Kedves ${providerName},` : "Kedves Szolgáltató,"}
      </p>

      <p style={s.text}>
        <strong>{visitorName}</strong> ajánlatkérést küldött neked:
      </p>

      <div style={s.highlight}>
        <p style={s.label}>Tárgy</p>
        <p style={s.value}>{subject}</p>
        <p style={s.label} >Kategória</p>
        <p style={s.value}>{category}</p>
        <p style={s.label}>Üzenet</p>
        <p style={{ ...s.value, fontStyle: "italic" }}>&ldquo;{messagePreview}&rdquo;</p>
      </div>

      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "28px auto" }}>
        <tr>
          <td style={s.btnCell}>
            <a href={ctaUrl} style={s.btn}>
              Ajánlatkérés megtekintése
            </a>
          </td>
        </tr>
      </table>

      <p style={s.mutedText}>
        Ha kérdésed van, keress minket a weboldalon lévő{" "}
        <a href="https://www.eskuvorekeszulok.hu/kapcsolat" style={s.link}>
          Kapcsolat
        </a>{" "}
        menü alatt.
      </p>
    </EmailLayout>
  );
}

NewQuoteRequestEmail.defaultProps = {
  providerName: undefined,
  visitorName: "Valaki",
  subject: "Ajánlatkérés",
  category: "",
  messagePreview: "",
  ctaUrl: "https://www.eskuvorekeszulok.hu/profil?tab=quotes",
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

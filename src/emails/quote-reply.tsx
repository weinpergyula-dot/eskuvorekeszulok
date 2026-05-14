import { EmailLayout } from "./email-layout";

interface QuoteReplyEmailProps {
  visitorName?: string;
  providerName: string;
  subject: string;
  ctaUrl: string;
}

export function QuoteReplyEmail({ visitorName, providerName, subject, ctaUrl }: QuoteReplyEmailProps) {
  return (
    <EmailLayout
      preview={`${providerName} válaszolt az ajánlatkérésedre – Esküvőre Készülök`}
      iconChar="✦"
      title="Válasz érkezett az ajánlatkérésedre"
      subtitle="Egy szolgáltató reagált a kérésedre."
    >
      <p style={s.text}>
        {visitorName ? `Kedves ${visitorName},` : "Kedves felhasználó,"}
      </p>

      <p style={s.text}>
        <strong>{providerName}</strong> válaszolt az ajánlatkérésedre:
      </p>

      <div style={s.highlight}>
        <p style={s.highlightText}>{subject}</p>
      </div>

      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "28px auto" }}>
        <tr>
          <td style={s.btnCell}>
            <a href={ctaUrl} style={s.btn}>
              Válasz megtekintése
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

QuoteReplyEmail.defaultProps = {
  visitorName: undefined,
  providerName: "Szolgáltató",
  subject: "Ajánlatkérés",
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

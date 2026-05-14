import { EmailLayout } from "./email-layout";

interface NewReviewEmailProps {
  providerName?: string;
  reviewerName: string;
  rating: number;
  comment?: string;
  ctaUrl: string;
}

export function NewReviewEmail({ providerName, reviewerName, rating, comment, ctaUrl }: NewReviewEmailProps) {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

  return (
    <EmailLayout
      preview={`${reviewerName} értékelte a profilodat – Esküvőre Készülök`}
      iconChar="★"
      title="Új értékelés érkezett"
      subtitle="Valaki értékelést hagyott a profilodon."
    >
      <p style={s.text}>
        {providerName ? `Kedves ${providerName},` : "Kedves Szolgáltató,"}
      </p>

      <p style={s.text}>
        <strong>{reviewerName}</strong> értékelést hagyott a profilodon:
      </p>

      <div style={s.highlight}>
        <p style={s.stars}>{stars}</p>
        {comment && <p style={s.comment}>&ldquo;{comment}&rdquo;</p>}
      </div>

      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "28px auto" }}>
        <tr>
          <td style={s.btnCell}>
            <a href={ctaUrl} style={s.btn}>
              Értékelések megtekintése
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

NewReviewEmail.defaultProps = {
  providerName: undefined,
  reviewerName: "Valaki",
  rating: 5,
  comment: undefined,
  ctaUrl: "https://www.eskuvorekeszulok.hu/profil#dashboard",
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
  stars: {
    margin: "0 0 8px 0",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "22px",
    color: "#84AAA6",
    letterSpacing: "2px",
  } as React.CSSProperties,
  comment: {
    margin: 0,
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "15px",
    color: "#404040",
    fontStyle: "italic",
    lineHeight: "1.6",
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

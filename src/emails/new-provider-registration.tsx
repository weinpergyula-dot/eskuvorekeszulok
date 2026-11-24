import { EmailLayout } from "./email-layout";

interface NewProviderRegistrationEmailProps {
  name: string;
  email: string;
  categories: string[];
  counties: string[];
  pricingText?: string | null;
  pricingPdfUrl?: string | null;
}

export function NewProviderRegistrationEmail({
  name,
  email,
  categories,
  counties,
  pricingText,
  pricingPdfUrl,
}: NewProviderRegistrationEmailProps) {
  return (
    <EmailLayout
      preview={`Új regisztrációs kérelem: ${name}`}
      iconChar="★"
      title="Új szolgáltatói regisztráció"
      subtitle="Admin jóváhagyásra vár"
    >
      <p style={s.text}>
        Egy új szolgáltató regisztrált az oldalon, és jóváhagyásra vár.
      </p>

      <table role="presentation" cellPadding={0} cellSpacing={0} style={s.table}>
        <tr>
          <td style={s.label}>Név:</td>
          <td style={s.value}>{name}</td>
        </tr>
        <tr>
          <td style={s.label}>E-mail:</td>
          <td style={s.value}>{email}</td>
        </tr>
        <tr>
          <td style={s.label}>Kategóriák:</td>
          <td style={s.value}>{categories.join(", ")}</td>
        </tr>
        <tr>
          <td style={s.label}>Területek:</td>
          <td style={s.value}>{counties.join(", ")}</td>
        </tr>
        {pricingText ? (
          <tr>
            <td style={s.label}>Árinformáció:</td>
            <td style={s.value}>{pricingText}</td>
          </tr>
        ) : null}
        {pricingPdfUrl ? (
          <tr>
            <td style={s.label}>Árlista PDF:</td>
            <td style={s.value}>
              <a href={pricingPdfUrl} style={s.link}>PDF megtekintése</a>
            </td>
          </tr>
        ) : null}
      </table>

      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "28px auto" }}>
        <tr>
          <td style={s.btnCell}>
            <a href="https://www.eskuvorekeszulok.hu/profil?tab=admin" style={s.btn}>
              Jóváhagyás az admin felületen
            </a>
          </td>
        </tr>
      </table>
    </EmailLayout>
  );
}

NewProviderRegistrationEmail.defaultProps = {
  name: "Teszt Szolgáltató",
  email: "teszt@example.com",
  categories: ["Fotós"],
  counties: ["Budapest"],
};

const s = {
  text: {
    margin: "0 0 20px 0",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "16px",
    color: "#404040",
    lineHeight: "1.6",
  } as React.CSSProperties,
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginBottom: "20px",
  } as React.CSSProperties,
  label: {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "14px",
    fontWeight: 700,
    color: "#555555",
    padding: "6px 12px 6px 0",
    verticalAlign: "top" as const,
    whiteSpace: "nowrap" as const,
    width: "140px",
  } as React.CSSProperties,
  value: {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "14px",
    color: "#404040",
    padding: "6px 0",
    verticalAlign: "top" as const,
  } as React.CSSProperties,
  link: {
    color: "#84AAA6",
    textDecoration: "underline",
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
} as const;

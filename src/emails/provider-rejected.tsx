import { EmailLayout } from "./email-layout";

interface ProviderRejectedEmailProps {
  name: string;
  reason?: string;
}

export function ProviderRejectedEmail({ name, reason }: ProviderRejectedEmailProps) {
  return (
    <EmailLayout
      preview="Tájékoztatás a szolgáltatói profil elbírálásáról"
      title="Profilod elbírálásra került"
      subtitle="Ezúttal nem tudtuk jóváhagyni a kérelmedet."
    >
      <p style={s.text}>Kedves {name},</p>

      <p style={s.text}>
        Sajnálattal értesítünk, hogy szolgáltatói profil kérelmed az{" "}
        <strong>Esküvőre Készülök</strong> oldalon ezúttal{" "}
        <strong>nem került jóváhagyásra</strong>.
      </p>

      {/* Indoklás doboz – csak ha van megadva */}
      {reason && (
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ margin: "0 0 16px 0" }}>
          <tr>
            <td style={s.reasonBox}>
              <p style={s.reasonLabel}>Indoklás:</p>
              <p style={s.reasonText}>{reason}</p>
            </td>
          </tr>
        </table>
      )}

      <p style={s.text}>
        Ha úgy gondolod, hogy ez tévedés, vagy szeretnéd módosítva újra
        benyújtani a profilodat, kérjük vedd fel velünk a kapcsolatot.
      </p>

      <p style={s.mutedText}>
        <a href="mailto:info@eskuvorekeszulok.hu" style={s.link}>
          info@eskuvorekeszulok.hu
        </a>
      </p>
    </EmailLayout>
  );
}

ProviderRejectedEmail.defaultProps = { name: "Minta Szolgáltató", reason: undefined };

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
  reasonBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "16px 20px",
  },
  reasonLabel: {
    margin: "0 0 6px 0",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "14px",
    fontWeight: 700,
    color: "#991b1b",
  } as React.CSSProperties,
  reasonText: {
    margin: 0,
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "15px",
    color: "#7f1d1d",
    lineHeight: "1.6",
  } as React.CSSProperties,
  link: {
    color: "#84AAA6",
    textDecoration: "underline",
  },
} as const;

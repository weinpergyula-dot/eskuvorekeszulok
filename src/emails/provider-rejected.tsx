import { Img } from "@react-email/components";
import { EmailLayout } from "./email-layout";

interface ProviderRejectedEmailProps {
  name: string;
  reason?: string;
}

// X ikon — fehér (teal háttéren)
const ICON_WHITE_X =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'/%3E%3Cline x1='6' y1='6' x2='18' y2='18'/%3E%3C/svg%3E";

// Figyelmeztető ikon — teal (fehér háttéren, az indoklás dobozban)
const ICON_TEAL_ALERT =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2384AAA6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='12' y1='8' x2='12' y2='12'/%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'/%3E%3C/svg%3E";

export function ProviderRejectedEmail({ name, reason }: ProviderRejectedEmailProps) {
  return (
    <EmailLayout
      preview="Tájékoztatás a szolgáltatói profil elbírálásáról"
      iconSrc={ICON_WHITE_X}
      title="Profilod elbírálásra került"
      subtitle="Ezúttal nem tudtuk jóváhagyni a kérelmedet."
    >
      <p style={s.text}>Kedves {name},</p>

      <p style={s.text}>
        Sajnálattal értesítünk, hogy szolgáltatói profil kérelmed az{" "}
        <strong>Esküvőre Készülök</strong> oldalon ezúttal{" "}
        <strong>nem került jóváhagyásra</strong>.
      </p>

      {/* Indoklás doboz — fehér háttéren teal ikon */}
      {reason && (
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ margin: "0 0 20px 0" }}>
          <tr>
            <td style={s.reasonBox}>
              {/* Ikon + cím egy sorban */}
              <table role="presentation" cellPadding={0} cellSpacing={0}>
                <tr>
                  <td style={{ verticalAlign: "middle", paddingRight: "8px" }}>
                    <Img src={ICON_TEAL_ALERT} width={16} height={16} alt="" style={{ display: "block" }} />
                  </td>
                  <td style={{ verticalAlign: "middle" }}>
                    <span style={s.reasonLabel}>Indoklás</span>
                  </td>
                </tr>
              </table>
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
    backgroundColor: "#f0f6f5",
    border: "1px solid #b8d4d1",
    borderRadius: "8px",
    padding: "16px 20px",
  },
  reasonLabel: {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "13px",
    fontWeight: 700,
    color: "#84AAA6",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  reasonText: {
    margin: "8px 0 0 0",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "15px",
    color: "#404040",
    lineHeight: "1.6",
  } as React.CSSProperties,
  link: {
    color: "#84AAA6",
    textDecoration: "underline",
  },
} as const;

import { Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./email-layout";

interface ProviderRejectedEmailProps {
  name: string;
  reason?: string;
}

export function ProviderRejectedEmail({
  name,
  reason,
}: ProviderRejectedEmailProps) {
  return (
    <EmailLayout preview="Tájékoztatás a szolgáltatói profil elbírálásáról">
      <Heading style={headingStyle}>Profilod elbírálásra került</Heading>

      <Text style={textStyle}>Kedves {name},</Text>

      <Text style={textStyle}>
        Sajnálattal értesítünk, hogy szolgáltatói profil kérelmed az{" "}
        <strong>Esküvőre Készülök</strong> oldalon ezúttal{" "}
        <strong>nem került jóváhagyásra</strong>.
      </Text>

      {reason && (
        <Section
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            padding: "16px",
            margin: "16px 0",
          }}
        >
          <Text
            style={{
              ...textStyle,
              margin: "0",
              color: "#991b1b",
              fontWeight: "600",
            }}
          >
            Indoklás:
          </Text>
          <Text style={{ ...textStyle, margin: "4px 0 0", color: "#7f1d1d" }}>
            {reason}
          </Text>
        </Section>
      )}

      <Text style={textStyle}>
        Ha úgy gondolod, hogy ez tévedés, vagy szeretnéd módosítva újra
        benyújtani a profilodat, kérjük vedd fel velünk a kapcsolatot az{" "}
        <a href="mailto:info@eskuvorekeszulok.hu" style={{ color: "#84AAA6" }}>
          info@eskuvorekeszulok.hu
        </a>{" "}
        címen.
      </Text>
    </EmailLayout>
  );
}

ProviderRejectedEmail.defaultProps = {
  name: "Minta Szolgáltató",
  reason: undefined,
};

const headingStyle = {
  color: "#dc2626",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 16px",
};

const textStyle = {
  color: "#3f3f46",
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0 0 12px",
};

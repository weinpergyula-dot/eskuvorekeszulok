import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./email-layout";

interface ProviderApprovedEmailProps {
  name: string;
}

export function ProviderApprovedEmail({ name }: ProviderApprovedEmailProps) {
  return (
    <EmailLayout preview="Profilod jóváhagyásra került – mostantól látható a látogatók számára!">
      <Heading style={headingStyle}>✅ Profilod jóváhagyásra került!</Heading>

      <Text style={textStyle}>Kedves {name},</Text>

      <Text style={textStyle}>
        Örömmel értesítünk, hogy szolgáltatói profilod az{" "}
        <strong>Esküvőre Készülök</strong> oldalon{" "}
        <strong>jóváhagyásra került</strong>, és mostantól látható az oldalon
        böngésző párok számára.
      </Text>

      <Text style={textStyle}>
        A profilodon megjelenik az összes megadott adatod, képeid és
        elérhetőségeid. Az érdeklődő párok közvetlenül rajtad keresztül
        tudnak majd ajánlatkérést küldeni.
      </Text>

      <Button
        href="https://eskuvorekeszulok.hu/profil"
        style={buttonStyle}
      >
        Profil megtekintése
      </Button>
    </EmailLayout>
  );
}

ProviderApprovedEmail.defaultProps = {
  name: "Minta Szolgáltató",
};

const headingStyle = {
  color: "#15803d",
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

const buttonStyle = {
  backgroundColor: "#84AAA6",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "6px",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
  marginTop: "8px",
};

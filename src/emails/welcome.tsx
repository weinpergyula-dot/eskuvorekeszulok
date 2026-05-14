import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./email-layout";

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <EmailLayout preview={`Üdvözlünk, ${name}! Regisztrációd sikeres volt.`}>
      <Heading
        style={{
          color: "#18181b",
          fontSize: "22px",
          fontWeight: "700",
          margin: "0 0 16px",
        }}
      >
        Üdvözlünk az Esküvőre Készülőn! 🎉
      </Heading>

      <Text style={textStyle}>Kedves {name},</Text>

      <Text style={textStyle}>
        Örömmel üdvözlünk közösségünkben! Regisztrációd sikeresen megtörtént –
        mostantól böngészheted az esküvői szolgáltatók kínálatát, jelölheted
        kedvenceidet, és ajánlatkérést küldhetsz nekik.
      </Text>

      <Button
        href="https://eskuvorekeszulok.hu/services"
        style={buttonStyle}
      >
        Szolgáltatók böngészése
      </Button>

      <Text style={{ ...textStyle, marginTop: "24px" }}>
        Ha kérdésed van, bármikor elérsz minket az{" "}
        <a href="mailto:info@eskuvorekeszulok.hu" style={{ color: "#84AAA6" }}>
          info@eskuvorekeszulok.hu
        </a>{" "}
        címen.
      </Text>
    </EmailLayout>
  );
}

// Alapértelmezett props (React Email preview-hoz)
WelcomeEmail.defaultProps = {
  name: "Minta Felhasználó",
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

import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

interface EmailLayoutProps {
  preview?: string;
  children: ReactNode;
}

const BASE_URL = "https://eskuvorekeszulok.hu";

const styles = {
  main: {
    backgroundColor: "#f4f4f5",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: {
    maxWidth: "560px",
    margin: "32px auto",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    overflow: "hidden" as const,
    border: "1px solid #e4e4e7",
  },
  header: {
    backgroundColor: "#84AAA6",
    padding: "24px 32px",
    textAlign: "center" as const,
  },
  headerText: {
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "700",
    margin: "0",
    letterSpacing: "-0.3px",
  },
  body: {
    padding: "32px",
  },
  footer: {
    padding: "16px 32px 24px",
  },
  footerText: {
    color: "#a1a1aa",
    fontSize: "12px",
    margin: "0",
    lineHeight: "1.6",
  },
  hr: {
    borderColor: "#e4e4e7",
    margin: "0",
  },
};

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="hu">
      <Head>
        {preview && (
          <meta name="x-apple-disable-message-reformatting" content="" />
        )}
      </Head>
      {/* Preview szöveg — nem jelenik meg a emailben, csak az inbox előnézetben */}
      {preview && (
        <Text
          style={{
            display: "none",
            maxHeight: "0",
            overflow: "hidden",
            opacity: 0,
            fontSize: "1px",
          }}
        >
          {preview}
        </Text>
      )}
      <Body style={styles.main}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.headerText}>Esküvőre Készülök</Text>
          </Section>

          {/* Tartalom */}
          <Section style={styles.body}>{children}</Section>

          {/* Footer */}
          <Hr style={styles.hr} />
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Ez egy automatikus értesítő email.{"\n"}
              Kérdés esetén írj nekünk:{" "}
              <a href={`mailto:info@eskuvorekeszulok.hu`} style={{ color: "#84AAA6" }}>
                info@eskuvorekeszulok.hu
              </a>
            </Text>
            <Text style={{ ...styles.footerText, marginTop: "8px" }}>
              © {new Date().getFullYear()} Esküvőre Készülök ·{" "}
              <a href={BASE_URL} style={{ color: "#84AAA6" }}>
                eskuvorekeszulok.hu
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

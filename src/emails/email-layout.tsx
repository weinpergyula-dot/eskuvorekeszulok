import {
  Body,
  Head,
  Html,
  Img,
  Preview,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

interface EmailLayoutProps {
  /** Inbox előnézeti szöveg */
  preview?: string;
  /** Teal fejléc ikon — fehér SVG data URI (teal háttéren fehér ikon) */
  iconSrc?: string;
  /** Teal fejléc cím */
  title: string;
  /** Teal fejléc alcím (opcionális) */
  subtitle?: string;
  /** Body tartalom */
  children: ReactNode;
}

export function EmailLayout({ preview, iconSrc, title, subtitle, children }: EmailLayoutProps) {
  return (
    <Html lang="hu">
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={s.body}>

        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={s.outer}>
          <tr>
            <td align="center">

              {/* Card */}
              <table role="presentation" width="100%" style={s.card}>

                {/* Logo sor — fehér háttér */}
                <tr>
                  <td style={s.logoCell}>
                    <Img
                      src="https://eskuvorekeszulok.hu/logo.png"
                      alt="Esküvőre Készülök"
                      height={40}
                      style={{ display: "block", margin: "0 auto" }}
                    />
                  </td>
                </tr>

                {/* Teal fejléc — fehér ikon + cím + alcím */}
                <tr>
                  <td style={s.tealCell}>
                    {iconSrc && (
                      <Img
                        src={iconSrc}
                        width={48}
                        height={48}
                        alt=""
                        style={{ display: "block", margin: "0 auto 16px auto" }}
                      />
                    )}
                    <h1 style={s.tealTitle}>{title}</h1>
                    {subtitle && (
                      <p style={s.tealSubtitle}>{subtitle}</p>
                    )}
                  </td>
                </tr>

                {/* Body tartalom — fehér háttér */}
                <tr>
                  <td style={s.bodyCell}>
                    {children}
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={s.footerCell}>
                    <Text style={s.footerText}>
                      © 2026 Esküvőre Készülök &nbsp;·&nbsp;
                      <a href="https://eskuvorekeszulok.hu" style={s.footerLink}>
                        eskuvorekeszulok.hu
                      </a>
                    </Text>
                  </td>
                </tr>

              </table>
              {/* /Card */}

            </td>
          </tr>
        </table>

      </Body>
    </Html>
  );
}

const s = {
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: "#f4f4f4",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  outer: {
    backgroundColor: "#f4f4f4",
    padding: "32px 16px",
  } as React.CSSProperties,
  card: {
    maxWidth: "560px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  } as React.CSSProperties,
  logoCell: {
    backgroundColor: "#ffffff",
    padding: "28px 40px",
    textAlign: "center" as const,
    borderBottom: "1px solid #eeeeee",
  },
  tealCell: {
    backgroundColor: "#84AAA6",
    padding: "32px 40px 28px 40px",
    textAlign: "center" as const,
  },
  tealTitle: {
    margin: 0,
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "24px",
    fontWeight: 700,
    color: "#ffffff",
    lineHeight: "1.3",
  } as React.CSSProperties,
  tealSubtitle: {
    margin: "12px 0 0 0",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "16px",
    color: "#e8f2f1",
    lineHeight: "1.5",
  } as React.CSSProperties,
  bodyCell: {
    padding: "36px 40px 16px 40px",
  },
  footerCell: {
    backgroundColor: "#f9f9f9",
    padding: "20px 40px",
    borderTop: "1px solid #eeeeee",
    textAlign: "center" as const,
  },
  footerText: {
    margin: 0,
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "13px",
    color: "#aaaaaa",
    lineHeight: "1.5",
  },
  footerLink: {
    color: "#84AAA6",
    textDecoration: "none",
  },
} as const;

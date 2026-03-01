import type { Metadata } from "next";
import Script from "next/script";
import { LayoutClient } from "./LayoutClient";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Swapnil Katiyar - Front-End Developer",
  description: "Portfolio of Swapnil Katiyar, Front-End Developer with 3+ years of experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script id="strip-bis-skin-checked" strategy="beforeInteractive">
          {`
            (function () {
              var attr = "bis_skin_checked";

              function strip(root) {
                if (!root || !root.querySelectorAll) return;
                var nodes = root.querySelectorAll("[" + attr + "]");
                for (var i = 0; i < nodes.length; i++) {
                  nodes[i].removeAttribute(attr);
                }
              }

              strip(document);

              var observer = new MutationObserver(function (mutations) {
                for (var i = 0; i < mutations.length; i++) {
                  var m = mutations[i];
                  if (m.type === "attributes" && m.attributeName === attr && m.target) {
                    m.target.removeAttribute(attr);
                  }
                  if (m.addedNodes && m.addedNodes.length) {
                    for (var j = 0; j < m.addedNodes.length; j++) {
                      var n = m.addedNodes[j];
                      if (n && n.nodeType === 1) {
                        if (n.hasAttribute && n.hasAttribute(attr)) {
                          n.removeAttribute(attr);
                        }
                        strip(n);
                      }
                    }
                  }
                }
              });

              observer.observe(document.documentElement, {
                subtree: true,
                childList: true,
                attributes: true,
                attributeFilter: [attr],
              });
            })();
          `}
        </Script>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}

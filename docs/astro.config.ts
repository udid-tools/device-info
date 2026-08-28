import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://udid-tools.github.io",
  base: "/device-info/",
  integrations: [
    starlight({
      title: "UDID Tools Device Info",
      description: "Offline TypeScript device-model and OS-build catalog.",
      customCss: ["./src/styles/custom.css"],
      editLink: {
        baseUrl: "https://github.com/udid-tools/device-info/edit/main/docs/",
      },
      lastUpdated: true,
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/udid-tools/device-info",
        },
      ],
      sidebar: [
        {
          label: "Start here",
          items: [
            { label: "Overview", slug: "index" },
            { label: "Installation", slug: "getting-started/installation" },
            { label: "Quick start", slug: "getting-started/quick-start" },
          ],
        },
        { label: "Reference", items: [{ autogenerate: { directory: "reference" } }] },
        { label: "Project", items: [{ autogenerate: { directory: "project" } }] },
      ],
    }),
  ],
});

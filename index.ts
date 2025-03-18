import type { AstroIntegration } from "astro";

type HtmxOptions = {
  extensions?: { name: string; path?: string }[];
};

/**
 * Add HTMX globally to your Astro project.
 *
 * Add the integration to your Astro config:
 *
 * ```js
 * import { defineConfig } from 'astro/config';
 * import htmx from 'astro-htmx';
 *
 * export default defineConfig({
 *   integrations: [htmx()]
 * });
 * ```
 *
 * To add HTMX extensions, use the `extensions` property
 * in the config:
 *
 * ```js
 * integrations: [
 *   htmx({
 *     extensions: [{ name: 'htmx-ext-response-targets' }]
 *   })
 * ]
 * ```
 *
 * **Remember** you will have to both install and register any extension you with to use.
 * For example, to install `htmx-ext-response-targets`, you can run:
 *
 * ```sh
 * npm install htmx-ext-response-targets
 * ```
 *
 * And then to register the extension, add the `hx-ext` property to some parent
 * of the element which uses the extension:
 *
 * ```html
 * <body hx-ext="response-targets"> ... </body>
 * ```
 */
export default function (options: HtmxOptions = {}): AstroIntegration {
  const { extensions = [] } = options;
  const safeExtName = (name: string): string =>
    name
      .split("-")
      .map((part, index) =>
        index === 0 ? part : part.charAt(0).toUpperCase() + part.substring(1),
      )
      .join("");

  return {
    name: "astro-htmx",
    hooks: {
      "astro:config:setup": ({ injectScript }) => {
        const extensionImports = extensions
          .map(
            (ext) =>
              `import * as ${safeExtName(ext.name)} from "${
                ext.path ?? ext.name
              }";`,
          )
          .join("\n");

        const extensionRegistrations = extensions
          .map(
            (ext) =>
              `htmx.defineExtension("${ext.name}", "${safeExtName(
                ext.name,
              )}");`,
          )
          .join("\n");

        injectScript(
          "page",
          `import * as htmx from "htmx.org";
          ${extensionImports}

          document.addEventListener('astro:after-swap', () => {
            htmx.process(document.body);
            ${extensionRegistrations}
          });

          window.htmx = htmx;`,
        );
      },
    },
  };
}

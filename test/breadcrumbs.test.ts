import { describe, expect, it } from "vitest";
import type { QuartzComponentProps } from "@quartz-community/types";
import { Breadcrumbs } from "../src/index";
import type { BreadcrumbOptions } from "../src/components/Breadcrumbs";
import { renderToHtml } from "./render";

interface Page {
  slug: string;
  filePath: string;
  relativePath: string;
  frontmatter: { title: string };
}

const page = (relativePath: string, title: string, slug?: string): Page => ({
  slug: slug ?? relativePath.replace(/\.md$/, "").toLowerCase().replace(/ /g, "-"),
  filePath: `content/${relativePath}`,
  relativePath,
  frontmatter: { title },
});

const allFiles: Page[] = [
  page("index.md", "Welcome"),
  page("Projects/index.md", "All my projects"),
  page("Projects/Garden/index.md", "Garden folder"),
  page("Projects/Garden/Tomatoes.md", "Growing tomatoes"),
  page("Projects/Loose.md", "A loose note"),
  page("Elsewhere/Moved.md", "Moved note", "moved"),
];

function crumbs(current: Page, opts?: Partial<BreadcrumbOptions>) {
  const Component = Breadcrumbs(opts);
  const props = {
    fileData: current,
    allFiles,
    displayClass: undefined,
    ctx: {},
    cfg: {},
  } as unknown as QuartzComponentProps;
  const html = renderToHtml(Component(props));
  const items = [...html.matchAll(/<a href="([^"]*)">([^<]*)<\/a>/g)].map((m) => [m[2], m[1]]);
  return { html, items };
}

const find = (relativePath: string) => allFiles.find((f) => f.relativePath === relativePath)!;

describe("Breadcrumbs", () => {
  it("renders the trail from the root to the current page with relative links", () => {
    const { html, items } = crumbs(find("Projects/Garden/Tomatoes.md"));
    expect(html.startsWith('<nav class="breadcrumb-container" aria-label="breadcrumbs">')).toBe(
      true,
    );
    expect(items).toEqual([
      ["Home", "../../"],
      ["All my projects", "../../projects/"],
      ["Garden folder", "../../projects/garden/"],
      ["Growing tomatoes", ""],
    ]);
  });

  it("separates crumbs with the spacer symbol, but not after the last one", () => {
    const { html } = crumbs(find("Projects/Loose.md"));
    expect(html.match(/<p> ❯ <\/p>/g)).toHaveLength(2); // three crumbs
    expect(html.endsWith("A loose note</a></div></nav>")).toBe(true);
  });

  it("honours spacerSymbol and rootName", () => {
    const { html, items } = crumbs(find("Projects/Loose.md"), {
      spacerSymbol: "/",
      rootName: "Start",
    });
    expect(html).toContain("<p> / </p>");
    expect(html).not.toContain("❯");
    expect(items[0]).toEqual(["Start", "../"]);
  });

  it("drops the current page with showCurrentPage: false", () => {
    const { items } = crumbs(find("Projects/Garden/Tomatoes.md"), { showCurrentPage: false });
    expect(items.map(([name]) => name)).toEqual(["Home", "All my projects", "Garden folder"]);
  });

  it("shows only the root crumb on the home page", () => {
    expect(crumbs(find("index.md")).items).toEqual([["Home", ""]]);
  });

  it("places a page with a permalink in its folder, linking back from its published URL", () => {
    const { items } = crumbs(find("Elsewhere/Moved.md"));
    // published at /moved (one level up from its file), so links are relative to that
    expect(items).toEqual([
      ["Home", "./"],
      ["Elsewhere", "./elsewhere/"],
      ["Moved note", ""],
    ]);
  });

  it("renders nothing for a page that is not in the file tree", () => {
    const Component = Breadcrumbs();
    const props = {
      fileData: { slug: "ghost/page", relativePath: "ghost/page.md" },
      allFiles,
      ctx: {},
      cfg: {},
    } as unknown as QuartzComponentProps;
    expect(renderToHtml(Component(props))).toBe("");
  });

  // bug: `resolveFrontmatterTitle` is documented ("Whether to use the title from frontmatter for
  // breadcrumb items", default true) but never read: folder crumbs always use the folder index's
  // frontmatter title.
  it.fails(
    "uses folder names instead of frontmatter titles with resolveFrontmatterTitle: false",
    () => {
      const { items } = crumbs(find("Projects/Garden/Tomatoes.md"), {
        resolveFrontmatterTitle: false,
      });
      expect(items.map(([name]) => name).slice(1, 3)).toEqual(["Projects", "Garden"]);
    },
  );
});

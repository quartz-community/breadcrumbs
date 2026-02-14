# @quartz-community/breadcrumbs

Displays breadcrumb navigation showing the page's position in the folder hierarchy.

## Installation

```bash
npx quartz plugin add github:quartz-community/breadcrumbs
```

## Usage

```ts
// quartz.layout.ts
import * as Plugin from "./.quartz/plugins";

// Add to your layout
Plugin.Breadcrumbs(); // in the appropriate layout section
```

## Configuration

| Option                    | Type      | Default  | Description                                                     |
| ------------------------- | --------- | -------- | --------------------------------------------------------------- |
| `spacerSymbol`            | `string`  | `"❯"`    | The symbol used to separate breadcrumb items.                   |
| `rootName`                | `string`  | `"Home"` | The name of the root item in the breadcrumbs.                   |
| `resolveFrontmatterTitle` | `boolean` | `true`   | Whether to use the title from frontmatter for breadcrumb items. |
| `showCurrentPage`         | `boolean` | `true`   | Whether to show the current page in the breadcrumbs.            |

## Documentation

See the [Quartz documentation](https://quartz.jzhao.xyz/) for more information.

## License

MIT

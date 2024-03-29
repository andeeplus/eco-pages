import { DepsManager, type EcoComponent } from "@eco-pages/core";

export type NavigationProps = {
  items: {
    label: string;
    url: string;
  }[];
};

export const Navigation: EcoComponent<NavigationProps> = ({ items }) => {
  return (
    <nav class="navigation">
      <ul>
        {items.map(({ label, url }) => (
          <li>
            <a href={url}>{label as "safe"}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

Navigation.dependencies = DepsManager.collect({ importMeta: import.meta });

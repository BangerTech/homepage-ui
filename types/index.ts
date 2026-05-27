export interface AppSettings {
  configPath: string;
  containerName: string;
}

export interface Service {
  name: string;
  icon?: string;
  href?: string;
  description?: string;
  server?: string;
  container?: string;
  id?: string;
  ping?: string;
  siteMonitor?: string;
  widget?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ServiceGroup {
  name: string;
  services: Service[];
}

export interface Bookmark {
  name: string;
  abbr?: string;
  icon?: string;
  href: string;
}

export interface BookmarkGroup {
  name: string;
  bookmarks: Bookmark[];
}

export interface ResourcesWidget {
  type: "resources";
  cpu?: boolean;
  memory?: boolean;
  disk?: string;
  cputemp?: boolean;
  uptime?: boolean;
  units?: string;
  refresh?: number;
}

export interface SearchWidget {
  type: "search";
  provider: string;
  target?: string;
  url?: string;
}

export interface OpenWeatherWidget {
  type: "openweathermap";
  label?: string;
  latitude?: number;
  longitude?: number;
  units?: string;
  provider?: string;
  apiKey?: string;
  cache?: number;
}

export type AnyWidget = ResourcesWidget | SearchWidget | OpenWeatherWidget | Record<string, unknown>;

export interface HomepageSettings {
  title?: string;
  favicon?: string;
  theme?: string;
  color?: string;
  useEqualHeights?: boolean;
  language?: string;
  background?: {
    image?: string;
    blur?: string;
    saturate?: number;
    brightness?: number;
    opacity?: number;
  };
  layout?: Record<string, {
    icon?: string;
    style?: string;
    columns?: number;
    useEqualHeights?: boolean;
    initiallyCollapsed?: boolean;
  }>;
}

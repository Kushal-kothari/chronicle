import { Category } from '../types/category';

/**
 * Domain → Category classification rules.
 * More specific patterns take priority (checked first).
 * User overrides always win.
 */
const RULES: Array<{ pattern: RegExp; category: Category }> = [
  // ─── Work ───────────────────────────────────────────────
  { pattern: /^(github|gitlab|bitbucket|sourcehut)\./, category: Category.Work },
  { pattern: /^(jira|confluence|atlassian)\./, category: Category.Work },
  { pattern: /^(notion|coda|airtable|clickup|asana|trello|monday|linear|basecamp)\./, category: Category.Work },
  { pattern: /^(slack|teams|webex|zoom|meet\.google|whereby|gather)\./, category: Category.Work },
  { pattern: /^(figma|sketch\.cloud|zeplin|invision|miro|mural|whimsical|lucid|excalidraw)\./, category: Category.Work },
  { pattern: /^(vercel|netlify|heroku|render|railway|fly\.io|supabase|neon\.tech|planetscale|turso)\./, category: Category.Work },
  { pattern: /^(aws\.amazon|console\.aws|cloud\.google|portal\.azure|digitalocean|linode|vultr|cloudflare)\./, category: Category.Work },
  { pattern: /^(docs\.google|sheets\.google|slides\.google|drive\.google|calendar\.google)\./, category: Category.Work },
  { pattern: /^(office|outlook|onedrive|sharepoint)\./, category: Category.Work },
  { pattern: /^(stripe|dashboard\.stripe|app\.hubspot|salesforce|zendesk|intercom|freshdesk)\./, category: Category.Work },
  { pattern: /^(grafana|datadog|sentry|newrelic|postman|insomnia)\./, category: Category.Work },
  { pattern: /^(docker|hub\.docker|npmjs|pypi|crates\.io|packagist|nuget)\./, category: Category.Work },
  { pattern: /^(jenkins|circleci|travis-ci|github\.com\/.*\/actions)/, category: Category.Work },
  { pattern: /^(notion|roamresearch|obsidian|logseq|remnote)\./, category: Category.Work },
  { pattern: /^(loom|screenpal|tella)\./, category: Category.Work },
  { pattern: /^(codesandbox|stackblitz|replit|codepen|jsfiddle|glitch)\./, category: Category.Work },
  { pattern: /^(leetcode|hackerrank|codewars|exercism|projecteuler)\./, category: Category.Work },
  { pattern: /^(app\.shortcut|shortcut)\./, category: Category.Work },

  // ─── Learning ───────────────────────────────────────────
  { pattern: /^(coursera|edx|udemy|pluralsight|udacity|skillshare|masterclass|brilliant|khanacademy|duolingo|babbel|rosettastone)\./, category: Category.Learning },
  { pattern: /^(developer\.mozilla|mdn\.)/, category: Category.Learning },
  { pattern: /^(docs\.(python|ruby-lang|rust-lang|php|swift|kotlin|dart|flutter|react|vue|angular|svelte|nextjs|nuxt|django|rails|laravel|express|fastapi|spring))/, category: Category.Learning },
  { pattern: /^(reactjs|vuejs|angular|svelte|nextjs|nuxtjs|nestjs|expressjs|fastapi|djangoproject|flask|rails|laravel|symfony)\./, category: Category.Learning },
  { pattern: /^(learn\.|docs\.|developer\.|devdocs|devhints)/, category: Category.Learning },
  { pattern: /^(medium)\./, category: Category.Learning },
  { pattern: /^(dev\.to|hashnode|substack)\./, category: Category.Learning },
  { pattern: /^(css-tricks|smashingmagazine|a11yproject|web\.dev|web\.archive)\./, category: Category.Learning },
  { pattern: /^(stackoverflow|stackexchange|superuser|serverfault|askubuntu)\./, category: Category.Learning },
  { pattern: /^(wikipedia|wikimedia|wiktionary|wikibooks)\./, category: Category.Learning },
  { pattern: /^(arxiv|pubmed|scholar\.google|jstor|ssrn|sciencedirect|springer|ieee|acm\.org)\./, category: Category.Learning },
  { pattern: /^(wolframalpha|desmos|geogebra|symbolab)\./, category: Category.Learning },
  { pattern: /^(egghead|frontendmasters|testingjavascript|leveluptutorials)\./, category: Category.Learning },
  { pattern: /^(app\.datacamp|kaggle)\./, category: Category.Learning },
  { pattern: /^(roadmap\.sh|theodinproject|freecodecamp|odinproject)\./, category: Category.Learning },

  // ─── Social ─────────────────────────────────────────────
  { pattern: /^(twitter|x\.com)/, category: Category.Social },
  { pattern: /^(facebook|fb)\./, category: Category.Social },
  { pattern: /^(instagram)\./, category: Category.Social },
  { pattern: /^(linkedin)\./, category: Category.Social },
  { pattern: /^(tiktok)\./, category: Category.Social },
  { pattern: /^(snapchat)\./, category: Category.Social },
  { pattern: /^(pinterest)\./, category: Category.Social },
  { pattern: /^(tumblr)\./, category: Category.Social },
  { pattern: /^(mastodon|threads\.net|bluesky|bsky\.app|nostr)/, category: Category.Social },
  { pattern: /^(whatsapp|web\.whatsapp|telegram|web\.telegram|signal|messenger|messages)\./, category: Category.Social },
  { pattern: /^(discord)\./, category: Category.Social },
  { pattern: /^(bereal)\./, category: Category.Social },

  // ─── Entertainment ──────────────────────────────────────
  { pattern: /^(netflix|hulu|disneyplus|hbomax|max\.com|peacocktv|paramountplus|appletv|primevideo)\./, category: Category.Entertainment },
  { pattern: /^(youtube)\./, category: Category.Entertainment },
  { pattern: /^(twitch)\./, category: Category.Entertainment },
  { pattern: /^(spotify|soundcloud|pandora|tidal|deezer|music\.apple|music\.amazon)\./, category: Category.Entertainment },
  { pattern: /^(crunchyroll|funimation|hidive|vrv)\./, category: Category.Entertainment },
  { pattern: /^(9gag|imgur|ifunny|reddit\.com\/r\/(gaming|funny|memes|aww|pics|gifs))/, category: Category.Entertainment },
  { pattern: /^(steam|store\.steampowered|epicgames|gog|itch\.io|xbox|playstation|nintendo)\./, category: Category.Entertainment },
  { pattern: /^(chess\.com|lichess|poki|crazygames)\./, category: Category.Entertainment },
  { pattern: /^(goodreads|letterboxd|trakt|imdb|rottentomatoes|metacritic)\./, category: Category.Entertainment },
  { pattern: /^(kick)\./, category: Category.Entertainment },
  { pattern: /^(strava|alltrails|komoot)\./, category: Category.Entertainment },

  // ─── News ───────────────────────────────────────────────
  { pattern: /^(cnn|foxnews|msnbc|nbc|abc|cbsnews|pbs)\./, category: Category.News },
  { pattern: /^(bbc|guardian|theguardian|independent|telegraph|ft|economist|thetimes)\./, category: Category.News },
  { pattern: /^(nytimes|washingtonpost|wsj|latimes|usatoday|nypost|thedailybeast)\./, category: Category.News },
  { pattern: /^(reuters|apnews|afp|bloomberg|businessinsider|axios|politico|thehill|vox|vice|buzzfeed)\./, category: Category.News },
  { pattern: /^(techcrunch|theverge|wired|arstechnica|engadget|gizmodo|venturebeat|thenextweb)\./, category: Category.News },
  { pattern: /^(news\.ycombinator|hackernews)/, category: Category.News },
  { pattern: /^(reddit\.com\/r\/(worldnews|news|politics|technology|science|investing|stocks))/, category: Category.News },
  { pattern: /^(feedly|inoreader|flipboard|pocket|instapaper|readwise)\./, category: Category.News },
  { pattern: /^(producthunt|indiehackers|lobste\.rs)\./, category: Category.News },
  { pattern: /^(reddit)\./, category: Category.News }, // Default reddit → News (overrideable)
];

/**
 * Returns the auto-detected category for a domain.
 * User overrides (from storage) take priority and should be applied after calling this.
 */
export function autoCategorize(domain: string): Category {
  const normalized = domain.toLowerCase().replace(/^www\./, '');

  for (const rule of RULES) {
    if (rule.pattern.test(normalized)) {
      return rule.category;
    }
  }

  return Category.Other;
}

/**
 * Get category with user override applied.
 */
export function getCategory(domain: string, overrides: Record<string, Category>): Category {
  if (overrides[domain] !== undefined) return overrides[domain];
  return autoCategorize(domain);
}

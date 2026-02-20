export interface GitHubRepo {
  name: string;
  description: string;
  url: string;
  stars: number;
  language: string | null;
  languageColor: string | null;
  updatedAt: string;
}

const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';

const PINNED_REPOS_QUERY = `
  query($username: String!) {
    user(login: $username) {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            stargazerCount
            primaryLanguage {
              name
              color
            }
            updatedAt
          }
        }
      }
    }
  }
`;

const TOP_REPOS_QUERY = `
  query($username: String!) {
    user(login: $username) {
      repositories(first: 6, orderBy: {field: STARGAZERS, direction: DESC}, ownerAffiliations: OWNER) {
        nodes {
          name
          description
          url
          stargazerCount
          primaryLanguage {
            name
            color
          }
          updatedAt
        }
      }
    }
  }
`;

const CACHE_KEY = 'github_repos_cache';
const CACHE_DURATION = 60 * 60 * 1000;

interface CacheData {
  repos: GitHubRepo[];
  timestamp: number;
}

const getCachedRepos = (): GitHubRepo[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { repos, timestamp }: CacheData = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return repos;
  } catch {
    return null;
  }
};

const setCachedRepos = (repos: GitHubRepo[]) => {
  try {
    const cacheData: CacheData = {
      repos,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    console.error('Failed to cache GitHub repos');
  }
};

const transformRepo = (repo: {
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  primaryLanguage: { name: string; color: string } | null;
  updatedAt: string;
}): GitHubRepo => ({
  name: repo.name,
  description: repo.description || 'No description available',
  url: repo.url,
  stars: repo.stargazerCount,
  language: repo.primaryLanguage?.name || null,
  languageColor: repo.primaryLanguage?.color || null,
  updatedAt: repo.updatedAt,
});

export const fetchGitHubRepos = async (
  username: string = 'iyogeshjoshi'
): Promise<GitHubRepo[]> => {
  const cached = getCachedRepos();
  if (cached) {
    console.log('Using cached GitHub repos');
    return cached;
  }

  const token = import.meta.env.VITE_GITHUB_TOKEN;

  console.log('GitHub token available:', !!token);
  console.log(
    'Token value:',
    token ? `${token.substring(0, 10)}...` : 'undefined'
  );

  if (!token) {
    console.error(
      'GitHub token not found. Make sure VITE_GITHUB_TOKEN is set in .env file or GitHub Secrets'
    );
    return [];
  }

  try {
    console.log('Fetching pinned repos from GitHub GraphQL API...');
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: PINNED_REPOS_QUERY,
        variables: { username },
      }),
    });

    const json = await response.json();
    console.log('GraphQL response:', JSON.stringify(json, null, 2));

    if (json.errors) {
      console.error('GitHub GraphQL errors:', json.errors);
      return fetchTopReposByStars(username, token);
    }

    const pinnedItems = json.data?.user?.pinnedItems?.nodes || [];
    console.log('Pinned repos found:', pinnedItems.length);

    if (pinnedItems.length > 0) {
      const repos = pinnedItems.map(transformRepo);
      setCachedRepos(repos);
      return repos;
    }

    console.log('No pinned repos found, fetching top starred repos...');
    return fetchTopReposByStars(username, token);
  } catch (error) {
    console.error('Failed to fetch GitHub repos:', error);
    return [];
  }
};

const fetchTopReposByStars = async (
  username: string,
  token: string
): Promise<GitHubRepo[]> => {
  try {
    console.log('Fetching top starred repos...');
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: TOP_REPOS_QUERY,
        variables: { username },
      }),
    });

    const json = await response.json();

    if (json.errors) {
      console.error('GitHub GraphQL errors:', json.errors);
      return [];
    }

    const repositories = json.data?.user?.repositories?.nodes || [];
    console.log('Top starred repos found:', repositories.length);

    const repos = repositories.map(transformRepo);
    setCachedRepos(repos);
    return repos;
  } catch (error) {
    console.error('Failed to fetch top repos:', error);
    return [];
  }
};

export const clearGitHubCache = () => {
  localStorage.removeItem(CACHE_KEY);
};

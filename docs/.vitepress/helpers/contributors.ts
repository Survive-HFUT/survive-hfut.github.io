import { Author } from '@nolebase/vitepress-plugin-git-changelog';
import { Octokit } from 'octokit';

type CustomAuthor = {
  /**
   * GitHub 用户 ID，可以通过访问 https://api.github.com/users/{username} 获取到
   */
  id: number;

  /**
   * 通过用户名或姓名等信息进行匹配的别名列表，建议包含 GitHub 登录名和显示名称的不同变体，以提高匹配的准确性
   */
  mapByNameAliases: string[];
};

const octokit = new Octokit(
  process.env.GITHUB_TOKEN
    ? {
        auth: process.env.GITHUB_TOKEN,
        userAgent: 'Survive-HFUT-Docs',
      }
    : undefined,
);

const customAuthors: CustomAuthor[] = [
  {
    id: 215695503,
    mapByNameAliases: ['HenryPan'],
  },
  {
    id: 81464408,
    mapByNameAliases: ['Junpgle .'],
  },
  {
    id: 62577485,
    mapByNameAliases: ['苦力怕水'],
  },
  {
    id: 273101381,
    mapByNameAliases: ['dfghj345'],
  },
];

const authors: Author[] = [
  {
    name: 'Copilot',
    username: 'copilot',
    links: 'https://copilot.github.com/',
    avatar: 'https://avatars.githubusercontent.com/in/946600',
    mapByNameAliases: [
      ...getNameAlias('copilot'),
      ...getNameAlias('GitHub Copilot'),
    ],
  },
];

async function getAuthors(): Promise<Author[]> {
  // 在开发环境中直接返回空表，避免频繁调用GitHub API

  // 如果需要在本地开发时测试此功能，可以在终端中新建变量 GITHUB_TOKEN 并赋值为一个有效的 GitHub 访问令牌
  // Powershell: $env:GITHUB_TOKEN = "your_token_here"
  // cmd: set GITHUB_TOKEN=your_token_here
  // Bash: export GITHUB_TOKEN="your_token_here"

  if (process.env.NODE_ENV !== 'production' && !process.env.GITHUB_TOKEN) {
    return authors;
  }

  try {
    return concat([
      // 获取头像的永久链接，避免默认情况下因跳转而无法缓存导致频繁请求
      ...(await fetchContributorsMap()),

      // co-author或非GitHub贡献者的自定义作者列表
      ...(await Promise.all(customAuthors.map(getAuthorDetail))),

      ...authors,
    ]);
  } catch (error) {
    console.error('Failed to fetch contributors from GitHub API:', error);
    return [];
  }
}

function concat(authors: Author[]): Author[] {
  const uniqueMap = new Map<string, Author>();

  for (const author of authors) {
    if (!author.name) {
      continue;
    }

    const existingAuthor = uniqueMap.get(author.name);
    if (!existingAuthor) {
      uniqueMap.set(author.name, author);
    } else {
      author.mapByNameAliases
        ?.filter((alias) => !existingAuthor.mapByNameAliases?.includes(alias))
        .forEach((alias) => existingAuthor.mapByNameAliases?.push(alias));
      author.mapByEmailAliases
        ?.filter((alias) => !existingAuthor.mapByEmailAliases?.includes(alias))
        .forEach((alias) => existingAuthor.mapByEmailAliases?.push(alias));
    }
  }

  return Array.from(uniqueMap.values());
}

async function getAuthorDetail(coAuthor: CustomAuthor): Promise<Author> {
  const user = await octokit.rest.users.getById({ account_id: coAuthor.id });
  return {
    name: user.data.name || user.data.login,
    links: user.data.html_url,
    avatar: user.data.avatar_url,
    mapByNameAliases: coAuthor.mapByNameAliases.concat(
      getNameAlias(user.data.login, user.data.name),
    ),
    mapByEmailAliases: [getDefaultEmail(user.data.id, user.data.login)],
  };
}

async function fetchContributorsMap(): Promise<Author[]> {
  const response = await octokit.rest.repos.listContributors({
    repo: 'survive-hfut.github.io',
    owner: 'Survive-HFUT',
  });

  return response.data.map((author) => ({
    name: author.name || author.login,
    links: author.html_url,
    avatar: author.avatar_url,
    mapByNameAliases: getNameAlias(author.login, author.name),
    mapByEmailAliases:
      author.id && author.login
        ? [getDefaultEmail(author.id, author.login)]
        : [],
  }));
}

function getNameAlias(login?: string, name?: string | null): string[] {
  const result = new Set<string>();
  if (login) {
    add(login);
  }

  if (name) {
    add(name);
  }

  return Array.from(result);

  function add(str: string) {
    result.add(str);
    result.add(str.toUpperCase());
    result.add(str.toLowerCase());
    result.add(str.replace(/^[a-z]/, (c) => c.toUpperCase()));
    result.add(str.replaceAll('-', ''));
    result.add(str.replaceAll('-', ' '));
  }
}

function getDefaultEmail(id: number, login: string): string {
  return `${id}+${login}@users.noreply.github.com`;
}

export default await getAuthors();

export interface BlogPostFrontmatter {
  title: string
  description: string
  pubDate: string
  draft?: boolean
  minutesRead: string
}

export interface BlogPost {
  url: string
  frontmatter: BlogPostFrontmatter
}

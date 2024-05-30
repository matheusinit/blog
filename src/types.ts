export interface BlogPostFrontmatter {
  title: string
  description: string
  pubDate: string
  draft?: boolean
}

export interface BlogPost {
  url: string
  frontmatter: BlogPostFrontmatter
}

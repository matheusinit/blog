import React, { type FC } from 'react'
import Fuse from 'fuse.js'
import type { BlogPost } from '../../types'

interface BlogPostsSearchParam {
  posts: BlogPost[]
}

export const BlogPostsSearch: FC<BlogPostsSearchParam> = ({ posts }) => {
  const fuse = new Fuse(posts, {
    keys: [
      {
        name: 'title',
        getFn: post => post.frontmatter.title
      },
      {
        name: 'description',
        getFn: post => post.frontmatter.description
      }
    ],
    threshold: 0.3
  })

  console.log(fuse.search('Astro'))

  return (
    <div>Hello World</div>
  )
}

import React, { useEffect, useState, type FC } from 'react'
import uuid from 'react-uuid'
import Fuse from 'fuse.js'

import type { BlogPost } from '../../types'
import { BlogPostCard } from './blog-post-card'
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

interface BlogPostsSearchParam {
  posts: BlogPost[]
}

export const BlogPostsSearch: FC<BlogPostsSearchParam> = ({ posts }) => {
  const [postsToView, setPostsToView] = useState<BlogPost[] | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string>('')

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
    threshold: 0.2
  })

  useEffect(() => {
    setPostsToView(posts)
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') return setPostsToView(posts)

    const postsSearchResult = fuse.search(searchQuery)

    const postsResult = postsSearchResult.map(result => result.item)
    setPostsToView([...postsResult])
  }, [searchQuery])

  return (
    <>
      <input
        type="text"
        className="mb-8 block w-full rounded-lg border border-app-violet-base px-3 py-2 text-gray-300 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-app-violet-dark/95"
        placeholder="Pesquise sobre Typescript"
        value={searchQuery}
        onChange={(event) => {
          const searchValue = event.target.value

          setSearchQuery(searchValue)
        }}
      />

      {(postsToView != null) && postsToView.length > 0 && (
        <div className="flex flex-col gap-y-4">
          {postsToView.map(post => (
            <BlogPostCard
              title={post.frontmatter.title}
              description={post.frontmatter.description}
              createdAt={format(new Date(post.frontmatter.pubDate), 'PP', { locale: ptBR })}
              readTime={post.frontmatter.minutesRead}
              key={uuid()}
              href={post.url}
            />
          ))}
        </div>
      )}

      {(postsToView != null) && posts.length > 0 && postsToView.length === 0 && (
        <>
          <div className="mt-4 mb-12 text-center text-xl font-medium">
            Não encontramos o que procura. Veja esses posts.
          </div>

          <div className="flex flex-col gap-y-4">
            {posts.slice(0, 3).map(post => (
              <BlogPostCard
                title={post.frontmatter.title}
                description={post.frontmatter.description}
                createdAt={post.frontmatter.pubDate}
                readTime={post.frontmatter.minutesRead}
                key={uuid()}
                href={post.url}
              />
            ))}
          </div>
        </>
      )}

      {posts.length === 0 && (
        <>
           <div className="mt-4 mb-12 text-center text-xl font-medium">
            Não tem nenhum post ainda, mas logo terá :)
          </div>
        </>
      )}
  </>
  )
}

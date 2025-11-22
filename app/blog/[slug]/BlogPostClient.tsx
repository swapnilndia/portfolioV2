'use client'

import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import type { BlogPost } from '@/data/posts'

interface BlogPostClientProps {
  post: BlogPost
}

export function BlogPostClient({ post }: BlogPostClientProps) {
  const { t } = useTranslation('blog')

  return (
    <Section title={post.title} subtitle={post.excerpt}>
      <div className="blog-post">
        <div className="blog-post__header">
          <Link href="/blog" className="blog-post__back">
            ← {t('backToBlog')}
          </Link>
        </div>

        <Card className="blog-post__card">
          <div className="blog-post__meta">
            <span className="blog-post__date">{post.date}</span>
            <span className="blog-post__read-time">{post.readTime}</span>
          </div>

          <div className="blog-post__tags">
            {post.tags.map((tag) => (
              <Tag key={tag} variant="default" size="sm">
                {tag}
              </Tag>
            ))}
          </div>

          <div className="blog-post__content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </Card>
      </div>
    </Section>
  )
}


"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { posts } from "@/data/posts";
import "./Blog.scss";

export default function BlogPage() {
  const { t } = useTranslation("blog");

  return (
    <Section title={t("title")} subtitle={t("subtitle")}>
      <div className="blog-page">
        <div className="blog-page__list">
          {posts.map((post) => (
            <Card key={post.slug} className="blog-page__card">
              <Link href={`/blog/${post.slug}`} className="blog-page__link">
                <h2 className="blog-page__title">{post.title}</h2>
              </Link>
              <p className="blog-page__excerpt">{post.excerpt}</p>
              <div className="blog-page__meta">
                <span className="blog-page__date">{post.date}</span>
                <span className="blog-page__read-time">{post.readTime}</span>
              </div>
              <div className="blog-page__tags">
                {post.tags.map((tag) => (
                  <Tag key={tag} variant="default" size="sm">
                    {tag}
                  </Tag>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}

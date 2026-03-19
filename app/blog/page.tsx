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
        <p className="blog-page__intro">{t("intro.paragraph")}</p>
        <div className="blog-page__list">
          {posts.map((post) => (
            <Card key={post.slug} as="article" className="blog-page__card">
              <div className="blog-page__header">
                <h2 className="blog-page__title">
                  <Link href={`/blog/${post.slug}`} className="blog-page__title-link">
                    <span className="blog-page__title-text">{post.title}</span>
                    <span className="blog-page__title-arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </h2>

                <div className="blog-page__meta">
                  <span className="blog-page__date">{post.date}</span>
                  <span className="blog-page__read-time">{post.readTime}</span>
                </div>

                <div className="blog-page__divider blog-page__divider--meta" aria-hidden="true" />
              </div>

              <div className="blog-page__body">
                <p className="blog-page__excerpt">{post.excerpt}</p>

                <div className="blog-page__bottom">
                  <div
                    className="blog-page__divider blog-page__divider--excerpt"
                    aria-hidden="true"
                  />

                  <div className="blog-page__tags">
                    {post.tags.map((tag) => (
                      <Tag key={tag} variant="primary" size="sm">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}

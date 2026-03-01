import { notFound } from "next/navigation";
import { BlogPostClient } from "./BlogPostClient";
import { posts } from "@/data/posts";
import "./BlogPost.scss";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return <BlogPostClient post={post} />;
}

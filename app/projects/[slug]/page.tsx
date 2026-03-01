import { notFound } from "next/navigation";
import { ProjectDetailClient } from "./ProjectDetailClient";
import { projects } from "@/data/projects";
import "./ProjectDetail.scss";

interface ProjectDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return <ProjectDetailClient project={project} />;
}

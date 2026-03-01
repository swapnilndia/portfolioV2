"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./MessageRenderer.scss";

export interface StructuredContent {
  type: "structured" | "text";
  content: {
    text?: string;
    sections?: ContentSection[];
  };
}

export interface ContentSection {
  type: "list" | "table" | "code" | "image" | "text";
  data: ListData | TableData | CodeData | ImageData | TextData;
}

export interface ListData {
  items: string[];
  ordered: boolean;
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface CodeData {
  code: string;
  language?: string;
}

export interface ImageData {
  url: string;
  alt?: string;
}

export interface TextData {
  text: string;
}

interface MessageRendererProps {
  content: StructuredContent | string;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ content }) => {
  // Wrap everything in try-catch to prevent crashes
  try {
    // Handle null/undefined content
    if (!content) {
      return (
        <div className="message-renderer">
          <div className="message-renderer__text">No content available</div>
        </div>
      );
    }

    // Handle legacy string format
    if (typeof content === "string") {
      return (
        <div className="message-renderer">
          <div className="message-renderer__markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>
      );
    }

    // Handle structured format - add null checks
    if (!content || typeof content !== "object" || !("type" in content)) {
      return (
        <div className="message-renderer">
          <div className="message-renderer__markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{String(content)}</ReactMarkdown>
          </div>
        </div>
      );
    }

    if (content.type === "text") {
      const text = content.content?.text || "";
      return (
        <div className="message-renderer">
          <div className="message-renderer__markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          </div>
        </div>
      );
    }

    if (content.type === "structured") {
      const sections = content.content?.sections || [];
      const introText = content.content?.text || "";

      return (
        <div className="message-renderer">
          {introText && (
            <div className="message-renderer__text">
              <div className="message-renderer__markdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{introText}</ReactMarkdown>
              </div>
            </div>
          )}
          {Array.isArray(sections) &&
            sections.length > 0 &&
            sections.map((section, index) => {
              if (!section || !section.type || !section.data) {
                return null;
              }
              return (
                <div
                  key={index}
                  className={`message-renderer__section message-renderer__section--${section.type}`}
                >
                  {renderSection(section)}
                </div>
              );
            })}
        </div>
      );
    }

    // Fallback
    return (
      <div className="message-renderer">
        <div className="message-renderer__markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {typeof content === "object" ? JSON.stringify(content, null, 2) : String(content)}
          </ReactMarkdown>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering message:", error, content);
    // Fallback to simple text rendering
    return (
      <div className="message-renderer">
        <div className="message-renderer__text">
          {typeof content === "string" ? content : "Error rendering message"}
        </div>
      </div>
    );
  }
};

function renderSection(section: ContentSection): React.ReactNode {
  if (!section || !section.type || !section.data) {
    return null;
  }

  try {
    switch (section.type) {
      case "list":
        return renderList(section.data as ListData);
      case "table":
        return renderTable(section.data as TableData);
      case "code":
        return renderCode(section.data as CodeData);
      case "image":
        return renderImage(section.data as ImageData);
      case "text":
        return renderText(section.data as TextData);
      default:
        return null;
    }
  } catch (error) {
    console.error("Error rendering section:", error, section);
    return null;
  }
}

function renderList(data: ListData): React.ReactNode {
  if (!data || !Array.isArray(data.items) || data.items.length === 0) {
    return null;
  }

  const ListTag = data.ordered ? "ol" : "ul";
  return (
    <ListTag className="message-renderer__list">
      {data.items.map((item, index) => (
        <li key={index} className="message-renderer__list-item">
          <div className="message-renderer__markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{String(item || "")}</ReactMarkdown>
          </div>
        </li>
      ))}
    </ListTag>
  );
}

function renderTable(data: TableData): React.ReactNode {
  if (!data || !Array.isArray(data.headers) || !Array.isArray(data.rows)) {
    return null;
  }

  return (
    <div className="message-renderer__table-wrapper">
      <table className="message-renderer__table">
        <thead>
          <tr>
            {data.headers.map((header, index) => (
              <th key={index} className="message-renderer__table-header">
                {String(header || "")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="message-renderer__table-row">
              {Array.isArray(row)
                ? row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="message-renderer__table-cell">
                      <div className="message-renderer__markdown">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {String(cell || "")}
                        </ReactMarkdown>
                      </div>
                    </td>
                  ))
                : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderCode(data: CodeData): React.ReactNode {
  if (!data || !data.code) {
    return null;
  }

  return (
    <div className="message-renderer__code-wrapper">
      {data.language && (
        <div className="message-renderer__code-language">{String(data.language)}</div>
      )}
      <pre className="message-renderer__code">
        <code>{String(data.code)}</code>
      </pre>
    </div>
  );
}

function renderImage(data: ImageData): React.ReactNode {
  if (!data || !data.url) {
    return null;
  }

  return (
    <div className="message-renderer__image-wrapper">
      {/* eslint-disable-next-line @next/next/no-img-element -- Image URLs in chat are
          dynamic external sources (AI-generated); next/image requires known domains
          in next.config.ts remotePatterns, which cannot be pre-configured here. */}
      <img
        src={String(data.url)}
        alt={data.alt || "Image"}
        className="message-renderer__image"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
        }}
      />
      {data.alt && <div className="message-renderer__image-caption">{String(data.alt)}</div>}
    </div>
  );
}

function renderText(data: TextData): React.ReactNode {
  if (!data || !data.text) {
    return null;
  }

  return (
    <div className="message-renderer__text">
      <div className="message-renderer__markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{String(data.text)}</ReactMarkdown>
      </div>
    </div>
  );
}

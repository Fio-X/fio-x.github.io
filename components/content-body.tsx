import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { ArticleTemplate } from "@/lib/content";

export function ContentBody({ children, sectionIds = {}, variant = "default" }: { children: string; sectionIds?: Record<string, string>; variant?: ArticleTemplate | "default" }) {
  return <div className={`content-body${variant === "default" ? "" : ` content-body-${variant}`}`}><ReactMarkdown skipHtml components={{
    h1: "h2",
    h2: ({ children: headingChildren }) => <h2 id={sectionIds[textContent(headingChildren)]}>{headingChildren}</h2>,
    p: ({ children: paragraphChildren }) => variant === "conversation" ? conversationParagraph(paragraphChildren) : <p>{paragraphChildren}</p>,
    img: ({ src, alt = "", ...props }) => variant === "image-notes"
      ? <figure className="template-media image-note-item"><img {...props} src={src} alt={alt} /><figcaption className="template-caption">{alt}</figcaption></figure>
      : <img {...props} src={src} alt={alt} />,
  }}>{children}</ReactMarkdown></div>;
}

function conversationParagraph(children: ReactNode) {
  const parts = Children.toArray(children);
  const first = parts[0];
  if (!isValidElement<{ children?: ReactNode }>(first) || first.type !== "strong") return <p>{children}</p>;
  const speaker = textContent(first.props.children).replace(/:\s*$/, "").trim();
  if (!speaker) return <p>{children}</p>;
  return <div className="conversation-row"><span className="conversation-speaker">{speaker}</span><div className="conversation-answer">{parts.slice(1)}</div></div>;
}

function textContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textContent).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textContent(node.props.children);
  return "";
}

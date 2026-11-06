import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown, { type Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import { MediaImage } from "@/components/media-image";
import type { ArticleTemplate } from "@/lib/content";

// singleTilde: false keeps Chinese ranges such as "3~5天" from turning into strikethrough; only ~~text~~ strikes through.
const REMARK_PLUGINS: Options["remarkPlugins"] = [[remarkGfm, { singleTilde: false }]];
// remark-rehype requires translated footnote labels on non-English pages (they are read by assistive technology).
const REMARK_REHYPE_OPTIONS: Options["remarkRehypeOptions"] = {
  footnoteLabel: "脚注",
  footnoteBackLabel: (referenceIndex, rereferenceIndex) => `返回引用 ${referenceIndex + 1}${rereferenceIndex > 1 ? `-${rereferenceIndex}` : ""}`,
};

export function ContentBody({ children, sectionIds = {}, variant = "default" }: { children: string; sectionIds?: Record<string, string>; variant?: ArticleTemplate | "default" }) {
  return <div className={`content-body${variant === "default" ? "" : ` content-body-${variant}`}`}><ReactMarkdown skipHtml remarkPlugins={REMARK_PLUGINS} remarkRehypeOptions={REMARK_REHYPE_OPTIONS} components={{
    h1: "h2",
    // Keep generated attributes (e.g. the footnote label's sr-only class and id); section anchors take precedence.
    h2: ({ node, children: headingChildren, ...props }) => { void node; return <h2 {...props} id={sectionIds[textContent(headingChildren)] ?? props.id}>{headingChildren}</h2>; },
    p: ({ children: paragraphChildren }) => variant === "conversation" ? conversationParagraph(paragraphChildren) : <p>{paragraphChildren}</p>,
    // react-markdown passes its syntax-tree `node`; keep it off the DOM element.
    img: ({ node, src, alt = "", ...props }) => {
      void node;
      if (typeof src !== "string") return null;
      const image = <MediaImage {...props} src={src} alt={alt} />;
      return variant === "image-notes" ? <figure className="template-media image-note-item">{image}<figcaption className="template-caption">{alt}</figcaption></figure> : image;
    },
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

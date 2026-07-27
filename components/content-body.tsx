import { isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";

export function ContentBody({ children, sectionIds = {} }: { children: string; sectionIds?: Record<string, string> }) {
  return <div className="content-body"><ReactMarkdown skipHtml components={{ h1: "h2", h2: ({ children: headingChildren }) => <h2 id={sectionIds[textContent(headingChildren)]}>{headingChildren}</h2> }}>{children}</ReactMarkdown></div>;
}

function textContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textContent).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textContent(node.props.children);
  return "";
}

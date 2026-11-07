import type { AnchorHTMLAttributes } from "react";
// Native anchors preserve browser navigation and avoid the framework beta's
// production-only client transition error. Keep all routes progressively usable.
export default function Link(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props}/>;
}

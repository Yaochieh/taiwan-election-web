import Link from "next/link";
import { partyColor } from "@/lib/format";

/**
 * 候選人 / 政治人物姓名 → /people/[name]
 */
export function PersonLink({
  name,
  color,
  className,
  children,
}: {
  name: string | null | undefined;
  color?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  if (!name) return <span className={className}>{children ?? "—"}</span>;
  return (
    <Link
      href={`/people/${encodeURIComponent(name)}`}
      className={
        "hover:underline underline-offset-4 transition " + (className || "")
      }
      style={color ? { color } : undefined}
    >
      {children ?? name}
    </Link>
  );
}

/**
 * 政黨 → /parties/[name]
 */
export function PartyLink({
  name,
  color,
  className,
  children,
}: {
  name: string | null | undefined;
  color?: string | null;
  className?: string;
  children?: React.ReactNode;
}) {
  if (!name || name === "無黨籍" || name.includes("無黨")) {
    return (
      <span className={"text-ink-soft " + (className || "")}>
        {children ?? name ?? "無黨籍"}
      </span>
    );
  }
  return (
    <Link
      href={`/parties/${encodeURIComponent(name)}`}
      className={
        "hover:underline underline-offset-4 transition " + (className || "")
      }
      style={{ color: color || partyColor(name) }}
    >
      {children ?? name}
    </Link>
  );
}

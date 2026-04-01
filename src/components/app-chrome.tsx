import Link from "next/link";

const links = [
  { href: "/", label: "Today" },
  { href: "/routines", label: "Routines" },
  { href: "/insights", label: "Insights" },
];

export function AppChrome({
  activePath,
  children,
}: Readonly<{
  activePath: string;
  children: React.ReactNode;
}>) {
  return (
    <main className="shell">
      <div className="backdrop backdrop-a" />
      <div className="backdrop backdrop-b" />
      <header className="topbar">
        <div className="brandlock">
          <span className="brand">Habitlane</span>
          <span className="tag">Recurring Work Operating System</span>
        </div>
        <nav className="topnav" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`navlink${activePath === link.href ? " navlink-active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </main>
  );
}

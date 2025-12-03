'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

type NavItem = {
  label: string;
  href: string;
  scrollId?: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/#home", scrollId: "home" },
  { label: "About", href: "/#about", scrollId: "about" },
  { label: "Planner", href: "/#planner", scrollId: "planner" },
  { label: "Profile", href: "/profile" },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id?: string) => {
    const onHomePage = pathname === "/";
    if (id && onHomePage) {
      e.preventDefault();
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setScrolled(scrollTop > 80);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full px-6 sm:px-10 lg:px-24 py-4 transition-colors duration-500 ${
        scrolled ? "bg-[#fcfaf4]" : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between">
        <button className="bg-transparent border-none text-[#1F2A37] text-lg font-bold">
          AI Meal Planner
        </button>

        <button
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center text-[#1F2A37] focus:outline-none"
          aria-label="Toggle navigation menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="sr-only">Open main menu</span>
          {menuOpen ? (
            <span className="relative block h-5 w-6">
              <span className="absolute inset-1/2 block h-0.5 w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
              <span className="absolute inset-1/2 block h-0.5 w-6 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current" />
            </span>
          ) : (
            <span className="flex flex-col items-center gap-1.5">
              <span className="block h-0.5 w-6 bg-current" />
              <span className="block h-0.5 w-6 bg-current" />
              <span className="block h-0.5 w-6 bg-current" />
            </span>
          )}
        </button>

        <ul className="hidden lg:flex flex-row list-none gap-6">
          {NAV_ITEMS.map((item) => (
            <li key={item.label} className="text-[#1F2A37] text-base font-medium">
              <Link href={item.href} onClick={(e) => handleSmoothScroll(e, item.scrollId)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className={`lg:hidden mt-4 rounded-lg border border-[#ede7df] bg-[#fcfaf4] shadow-sm ${menuOpen ? "block" : "hidden"}`}>
        <ul className="flex flex-col divide-y divide-[#ede7df]">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="block px-4 py-3 text-center text-[#1F2A37] text-base font-medium"
                onClick={(e) => handleSmoothScroll(e, item.scrollId)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;

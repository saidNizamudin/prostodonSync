import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-5 py-3 text-center text-sm text-muted-foreground shrink-0">
      Created by{" "}
      <Link
        className="underline hover:text-foreground"
        href="https://said-nizamudin.netlify.app/"
      >
        @Bingbong
      </Link>
    </footer>
  );
}

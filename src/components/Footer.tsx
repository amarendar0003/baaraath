export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Baaraath. All rights reserved.
      </div>
    </footer>
  );
}
import Logo from './Logo'

// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="border-t mt-12">
      <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-gray-600 flex flex-wrap gap-4">
        <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
        <span>•</span>
        <a href="/terms" className="hover:underline">Terms</a>
        <span>•</span>
        <a href="/delete-account" className="hover:underline">Delete Account</a>
        <span className="ml-auto">© {new Date().getFullYear()} Instantly Cards</span>
      </div>
    </footer>
  );
}

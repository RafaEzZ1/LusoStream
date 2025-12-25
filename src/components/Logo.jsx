import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
      LusoStream
    </Link>
  );
}
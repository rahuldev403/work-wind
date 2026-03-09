import Image from "next/image";
import Link from "next/link";
export default function Home() {
  return (
    <>
      <div>
        <h1 className="text-3xl text-gray-300">hellow world!</h1>
        <Link href="/services"> services </Link>
      </div>
    </>
  );
}

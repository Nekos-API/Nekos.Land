import Link from "next-intl/link";

export default function Footer() {
    return (
        <div className="hidden md:flex flex-col items-center justify-center p-4 select-none">
            <div className="text-neutral-600 flex flex-row items-center gap-2 text-sm">
                Made with ❤️ by <Link href="https://nekidev.com" target="_blank" className="hover:text-rose-200 transition">Nekidev</Link>
                <b>&middot;</b>
                <Link href="https://discord.gg/PgQnuM3YnM" target="_blank" className="hover:text-rose-200 transition">Join our Discord</Link>
                <b>&middot;</b>
                <Link href="https://github.com/Nekos-API/Nekos-Land" target="_blank" className="hover:text-rose-200 transition">GitHub repository</Link>
                <b>&middot;</b>
                <Link href="https://nekosapi.com" target="_blank" className="hover:text-rose-200 transition">API Docs</Link>
                <b>&middot;</b>
                <Link href="https://status.nekosapi.com" target="_blank" className="hover:text-rose-200 transition">Status</Link>
            </div>
        </div>
    )
}
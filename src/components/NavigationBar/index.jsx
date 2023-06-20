import React from "react";

import { useSession, signIn, signOut } from "next-auth/react";

import Link from "next/link";

import { useTranslations } from 'next-intl';
import { ChevronDownIcon, ArrowLeftOnRectangleIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

import styles from "./styles.module.css";

import CatIcon from "@/components/CatIcon";
import Popup from "@/components/Popup";

export default function NavigationBar() {
    const { data: session } = useSession();
    const t = useTranslations("NavigationBar");
    const [navBackground, setNavBackground] = React.useState("transparent");

    React.useEffect(() => {
        // Set the background color of the navbar to black on scroll.
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setNavBackground("black");
            } else {
                setNavBackground("transparent");
            }
        }
        window.addEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="sticky top-0 left-0 right-0 flex flex-row items-center p-4 transition-colors duration-300" style={{
            backgroundColor: navBackground
        }}>
            <div className="flex-1 flex flex-row items-center gap-2">
                <div className="text-rose-400"><CatIcon className="h-8 w-8" /></div>
                <div className="font-medium text-2xl">Nekos.Land</div>
            </div>
            <div className="flex-1 flex flex-row items-center justify-center gap-8">
                <Link href="/" className={styles.navLink}>{t("home")}</Link>
                <Link href="/gallery" className={styles.navLink}>{t("gallery")}</Link>
                <Link href="/about" className={styles.navLink}>{t("about")}</Link>
            </div>
            <div className="flex-1 flex flex-row items-center justify-end">
                {session ? <ProfileButton /> : <LoginButton />}
            </div>
        </div>
    )
}

function ProfileButton() {
    const { data: session } = useSession();
    const t = useTranslations("NavigationBar");

    return (
        <Popup
            trigger={(
                <div className="flex flex-row items-center gap-2 group cursor-pointer">
                    <ChevronDownIcon className="h-5 w-5 text-neutral-500 stroke-2" />
                    <img src={session?.user?.avatarImage} className="h-9 w-9 rounded-full object-fit object-center bg-neutral-900 group-hover:scale-95 transition-all" />
                </div>
            )}
            alignment="bottom-right"
            popupContainerClassName="pt-4"
            on="click"
            initialAnim={{
                opacity: 0,
                y: -10,
                transition: {
                    duration: 0.15
                }
            }}
            animate={{
                opacity: 1,
                y: 0,
                transition: {
                    duration: 0.15
                }
            }}
            exitAnim={{
                opacity: 0,
                y: -10,
                transition: {
                    duration: 0.15
                }
            }} >
            <div className="relative rounded bg-neutral-900 py-2 leading-none whitespace-nowrap w-40 before:h-2.5 before:w-2.5 before:bg-neutral-900 before:absolute before:right-[0.825rem] before:-top-1 before:rotate-45 before:rounded-sm">
                <button className="py-2 px-4 hover:bg-red-500 w-full flex flex-row items-center justify-start gap-2 transition-colors" onClick={() => { signOut() }}>
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                    {t("log_out")}
                </button>
            </div>
        </Popup >
    );
}

function LoginButton() {
    const t = useTranslations("NavigationBar");

    return (
        <button onClick={() => { signIn("nekos-api") }} className="rounded-full py-2 px-4 bg-neutral-900 flex flex-row items-center gap-2 transition-all hover:scale-95">
            <ArrowRightOnRectangleIcon className="h-5 w-5 stroke-2" />
            {t("log_in")}
        </button>
    );
}
"use client";

import React from "react";

import Link from 'next-intl/link';
import { usePathname } from 'next-intl/client';
import { useSession, signIn, signOut } from "next-auth/react";

import { useTranslations } from 'next-intl';
import { ChevronDownIcon, ArrowLeftOnRectangleIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon, HomeIcon, Squares2X2Icon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

import styles from "./styles.module.css";

import CatIcon from "@/components/CatIcon";
import DiscordIcon from "@/components/DiscordIcon";
import GithubIcon from "@/components/GithubIcon";
import Popup from "@/components/Popup";
import { motion, AnimatePresence } from "framer-motion";

const NavbarContext = React.createContext({});

export default function NavigationBar() {
    const pathname = usePathname();

    const { data: session } = useSession();
    const t = useTranslations("NavigationBar");
    const [navBackground, setNavBackground] = React.useState("transparent");

    const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

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

    return (<NavbarContext.Provider value={{ isMobileNavOpen, setIsMobileNavOpen }}>
        <div className={`sticky top-0 left-0 right-0 flex flex-row items-center p-4 transition-all duration-300 z-20 ${isMobileNavOpen ? "border-b border-b-neutral-800" : "border-b-transparent"}`} style={{
            backgroundColor: isMobileNavOpen ? "transparent" : navBackground
        }}>
            <div className="flex-1 flex flex-row items-center gap-0.5">
                <button className="md:hidden p-2.5 rounded-full hover:bg-white/10 transition-all relative" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}>
                    <Bars3Icon className="h-6 w-6 transition-all" style={{
                        opacity: isMobileNavOpen ? 0 : 1
                    }} />
                    <XMarkIcon className="h-6 w-6 transition-all absolute top-0 bottom-0 my-auto" style={{
                        opacity: isMobileNavOpen ? 1 : 0
                    }} />
                </button>
                <div className="flex flex-row items-center gap-2">
                    <div className="text-rose-400"><CatIcon className="h-8 w-8" /></div>
                    <div className="hidden sm:block font-medium text-2xl">Nekos.Land</div>
                </div>
            </div>
            <div className="flex-1 hidden md:flex flex-row items-center justify-center gap-8 whitespace-nowrap">
                <Link href="/" className={styles.navLink + (pathname == "/" ? " " + styles.selected : "")}>{t("home")}</Link>
                <Link href="/gallery" className={styles.navLink}>{t("gallery")}</Link>
                <Link href="/about" className={styles.navLink}>{t("about")}</Link>
            </div>
            <div className="flex-1 flex flex-row items-center justify-end">
                {session ? <ProfileButton /> : <LoginButton />}
            </div>
        </div>
        <AnimatePresence>
            {isMobileNavOpen && (
                <motion.div
                    key="sidebar"
                    className="w-screen h-screen fixed top-0 bottom-0 left-0 right-0 pt-[4.75rem] bg-neutral-900 rounded-l z-10"
                    initial={{ x: "-100vw" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100vw" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}>
                    <div className="py-4">
                        <span className="block text-xs font-semibold text-rose-400 pl-[1.625rem] leading-none my-2">Website</span>
                        <MobileNavLink icon={(<HomeIcon />)} label={t("home")} href="/" />
                        <MobileNavLink icon={(<Squares2X2Icon />)} label={t("gallery")} href="/gallery" />
                        <MobileNavLink icon={(<QuestionMarkCircleIcon />)} label={t("about")} href="/about" />

                        <span className="block text-xs font-semibold text-rose-400 pl-[1.625rem] leading-none mb-2 mt-6">Links</span>
                        <MobileNavLink icon={(<DiscordIcon className="h-6 w-6" />)} label="Discord" href="https://discord.com/invite/PgQnuM3YnM" />
                        <MobileNavLink icon={(<GithubIcon className="h-6 w-6" />)} label="GitHub" href="https://github.com/Nekos-API/Nekos-Land" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </NavbarContext.Provider>)
}

function ProfileButton() {
    const { data: session } = useSession();
    const { isMobileNavOpen } = React.useContext(NavbarContext);

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
            <div className={`relative rounded ${isMobileNavOpen ? "bg-neutral-800" : "bg-neutral-900"} py-2 leading-none whitespace-nowrap w-40 before:h-2.5 before:w-2.5 ${isMobileNavOpen ? "before:bg-neutral-800" : "before:bg-neutral-900"} before:absolute before:right-[0.825rem] before:-top-1 before:rotate-45 before:rounded-sm`}>
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
    const { isMobileNavOpen } = React.useContext(NavbarContext);

    return (
        <button onClick={() => { signIn("nekos-api") }} className={`rounded-full py-2 px-4 flex flex-row items-center gap-2 transition-all hover:scale-95 whitespace-nowrap ${isMobileNavOpen ? "bg-neutral-800" : "bg-neutral-900"}`}>
            <ArrowRightOnRectangleIcon className="h-5 w-5 stroke-2" />
            {t("log_in")}
        </button>
    )
}

function MobileNavLink({ icon, label, href }) {
    return (
        <Link href={href} className="px-[1.625rem] py-2 flex flex-row items-center gap-4 transition-colors hover:bg-neutral-800">
            <div className="h-6 w-6 flex flex-col justify-center">{icon}</div>
            <div>{label}</div>
        </Link>
    )
}
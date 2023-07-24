"use client";

import React from "react";

import { useSession } from "next-auth/react";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next-intl/client";
import { useSearchParams } from "next/navigation";
import {
    ArrowLeftIcon,
    ChevronRightIcon,
    CodeBracketIcon,
    ExclamationCircleIcon,
    UserCircleIcon,
    WrenchScrewdriverIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

import CatIcon from "../CatIcon";
import Loading from "../Loading";

export default function SettingsModal() {
    const session = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations("Settings");

    const [selectedTab, setSelectedTab] = React.useState(0);
    const [openTab, setOpenTab] = React.useState();

    function Tab({ icon, title, tabIndex }) {
        const selected = tabIndex === selectedTab;

        return (
            <button
                className={
                    "flex flex-row items-center justify-between w-full py-2 px-4 transition hover:bg-neutral-800 " +
                    (selected
                        ? "sm:text-rose-400 sm:bg-rose-400/10 sm:hover:bg-rose-400/20" : "")
                }
                onClick={() => {
                    setSelectedTab(tabIndex)
                    setOpenTab(tabIndex)
                }}
            >
                <div className="flex flex-row items-center leading-none gap-4 text-sm">
                    {icon}
                    {title}
                </div>
                <ChevronRightIcon className="h-5 w-5 stroke-2" />
            </button>
        );
    }

    return (
        <AnimatePresence>
            {session.data &&
                searchParams.has("modal") &&
                searchParams.get("modal").split(",").includes("settings") && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        transition={{ duration: 0.15 }}
                        className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50 flex items-center justify-center"
                    >
                        <div
                            className="absolute top-0 bottom-0 left-0 right-0"
                            onClick={() => router.back()}
                        ></div>
                        <motion.div
                            className="flex flex-row items-start gap-px overflow-hidden m-4 w-full max-w-4xl h-full max-h-[30rem] bg-neutral-800 rounded z-10 relative"
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                        >
                            <div className={"flex flex-col bg-neutral-900 flex-1 sm:flex-none sm:w-60 h-full " + (openTab != undefined ? "hidden sm:flex" : "")}>
                                <div className="text-2xl font-medium p-4 pb-6 leading-none flex flex-row items-center justify-between">
                                    {t("settings")}
                                    <button className="p-1.5 -m-1.5 rounded-full hover:bg-neutral-800 transition" onClick={() => router.back()}>
                                        <XMarkIcon className="h-5 w-5 stroke-2" />
                                    </button>
                                </div>
                                <div className="py-2">
                                    <Tab
                                        tabIndex={0}
                                        icon={
                                            <img
                                                src={
                                                    session?.data.user
                                                        .avatarImage
                                                }
                                                className="h-6 w-6 rounded-full object-cover"
                                            />
                                        }
                                        title={t("profile")}
                                    />
                                    <Tab
                                        tabIndex={1}
                                        icon={
                                            <UserCircleIcon className="h-6 w-6 stroke-2" />
                                        }
                                        title={t("account")}
                                    />
                                    <Tab
                                        tabIndex={2}
                                        icon={
                                            <CodeBracketIcon className="h-6 w-6 stroke-2" />
                                        }
                                        title={t("applications")}
                                    />
                                </div>
                            </div>
                            <div className={"flex-1 bg-neutral-900 h-full flex-col relative " + (openTab == undefined ? "hidden sm:flex" : "flex")}>
                                {selectedTab === 0 && <ProfileTab goBack={setOpenTab} />}
                                {selectedTab === 1 && <AccountTab goBack={setOpenTab} />}
                                {selectedTab === 2 && <ApplicationsTab goBack={setOpenTab} />}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
        </AnimatePresence>
    );
}

function ProfileTab({ goBack }) {
    const session = useSession();

    const t = useTranslations("Settings");

    const [user, setUser] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    const usernameInputRef = React.useRef();
    const nicknameInputRef = React.useRef();
    const biographyInputRef = React.useRef();

    const [usernameAvailability, setUsernameAvailability] =
        React.useState("available");

    // Load the user
    React.useEffect(() => {
        fetch("https://api.nekosapi.com/v2/users/@me", {
            headers: {
                Accept: "application/vnd.api+json",
                Authorization: `Bearer ${session.data.accessToken}`,
            },
            cache: "no-cache"
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((json) => {
                        setUser(json);
                        setIsLoading(false);
                    });
                } else {
                    setError(true);
                    setIsLoading(false);
                }
            })
            .catch((e) => {
                setIsLoading(false);
                setError(true);
            });
    }, []);

    if (isLoading) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <CatIcon className="h-8 w-8 text-neutral-600" />
                <Loading />
            </div>
        );
    } else if (error) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <ExclamationCircleIcon className="h-8 w-8 text-rose-400" />
                <div className="text-rose-400">
                    {t("error")}
                </div>
            </div>
        );
    }

    function discardChanges() {
        usernameInputRef.current.value = user.data.attributes.username;
        nicknameInputRef.current.value = user.data.attributes.nickname;
        biographyInputRef.current.value = user.data.attributes.biography;
    }

    async function saveChanges() {
        const res = await fetch(
            "https://api.nekosapi.com/v2/users/" + user.data.id,
            {
                method: "PATCH",
                cache: "no-cache",
                headers: {
                    "Content-Type": "application/vnd.api+json",
                    Accept: "application/vnd.api+json",
                    Authorization: `Bearer ${session.data.accessToken}`
                },
                body: JSON.stringify({
                    data: {
                        type: "user",
                        id: user.data.id,
                        attributes: {
                            username: usernameInputRef.current.value,
                            nickname: nicknameInputRef.current.value,
                            biography: biographyInputRef.current.value,
                        },
                    },
                }),
            }
        );

        if (res.status < 200 || res.status >= 300) {
            alert(t("error"));
        } else {
            alert(t("saved_changes"));
            session.update();
        }

        const json = await res.json();
        setUser(json);
    }

    async function checkUsernameAvailability(username) {
        if (
            username.toLowerCase() ==
            user.data.attributes.username.toLowerCase()
        ) {
            setUsernameAvailability("available");
            return;
        } else if (!/^([0-9]|[a-z]|_|\.)+$/.test(username)) {
            setUsernameAvailability("invalid");
            return;
        } else if (username.length < 4) {
            setUsernameAvailability("short");
            return;
        }

        setUsernameAvailability("loading");

        const res = await fetch(
            "https://api.nekosapi.com/v2/users?fields[user]=username&filter[username.iexact]=" +
            encodeURIComponent(username),
            {
                headers: {
                    "Content-Type": "application/vnd.api+json",
                    Accept: "application/vnd.api+json",
                    Authorization: `Bearer ${session.data.accessToken}`
                },
                cache: "no-cache"
            }
        );

        if (res.status < 200 && res.status >= 300) {
            setUsernameAvailability("error");
        } else if ((await res.json()).data.length > 0) {
            setUsernameAvailability("unavailable");
        } else {
            setUsernameAvailability("available");
        }
    }

    const handleUsernameInputChange = (event) => {
        const { value } = event.target;

        // Clear the previous timer and set a new one whenever the user types something.
        if (handleUsernameInputChange.timeoutId) {
            clearTimeout(handleUsernameInputChange.timeoutId);
        }

        // Set a new timer for 1 second after the user stops typing.
        handleUsernameInputChange.timeoutId = setTimeout(() => {
            checkUsernameAvailability(value).then(() => { });
        }, 1000);
    };

    return (
        <>
            <div className="text-xl font-medium p-4 flex flex-row items-center gap-2">
                <button className="p-1.5 -my-1.5 -ml-1.5 rounded-full hover:bg-neutral-800 transition block sm:hidden" onClick={() => goBack()}>
                    <ArrowLeftIcon className="h-5 w-5 stroke-2" />
                </button>
                {t("profile")}
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-4">
                <div className="text-sm flex flex-col gap-1">
                    <div className="flex flex-row items-center gap-1">
                        {t("username")}
                        <span className="text-xs text-neutral-400">
                            &#8212;
                        </span>
                        {usernameAvailability === "available" && (
                            <div className="text-green-400 text-xs">
                                {t("available")}
                            </div>
                        )}
                        {usernameAvailability === "unavailable" && (
                            <div className="text-red-400 text-xs">
                                {t("unavailable")}
                            </div>
                        )}
                        {usernameAvailability === "loading" && (
                            <div className="text-neutral-400 text-xs">
                                {t("loading")}...
                            </div>
                        )}
                        {usernameAvailability === "error" && (
                            <div className="text-yellow-400 text-xs">{t("error")}</div>
                        )}
                        {usernameAvailability === "invalid" && (
                            <div className="text-yellow-400 text-xs">
                                {t("invalid_username")}
                            </div>
                        )}
                        {usernameAvailability === "short" && (
                            <div className="text-yellow-400 text-xs">
                                {t("username_too_short")}
                            </div>
                        )}
                    </div>
                    <input
                        className="w-full outline-none rounded p-2 leading-none border border-neutral-800 bg-transparent placeholder:text-neutral-400 focus:ring-1 focus:ring-rose-400 transition"
                        placeholder={t("username")}
                        defaultValue={user.data.attributes.username}
                        ref={usernameInputRef}
                        maxLength={32}
                        onInput={handleUsernameInputChange}
                    />
                </div>
                <div className="text-sm flex flex-col gap-1">
                    <div>{t("nickname")}</div>
                    <input
                        className="w-full outline-none rounded p-2 leading-none border border-neutral-800 bg-transparent placeholder:text-neutral-400 focus:ring-1 focus:ring-rose-400 transition"
                        placeholder={t("nickname")}
                        defaultValue={user.data.attributes.nickname}
                        maxLength={50}
                        ref={nicknameInputRef}
                    />
                </div>
                <div className="text-sm flex flex-col gap-1">
                    <div>{t("biography")}</div>
                    <textarea
                        className="w-full outline-none rounded p-2 leading-none border border-neutral-800 bg-transparent placeholder:text-neutral-400 focus:ring-1 focus:ring-rose-400 transition resize-y"
                        placeholder={t("biography_placeholder", {
                            name: user.data.attributes.nickname &&
                                user.data.attributes.nickname.length > 0
                                ? user.data.attributes.nickname
                                : user.data.attributes.username
                        })}
                        defaultValue={user.data.attributes.biography}
                        rows={3}
                        maxLength={500}
                        ref={biographyInputRef}
                    ></textarea>
                </div>
            </div>
            <div className="p-4 flex flex-row items-center justify-end gap-4">
                <button
                    className="rounded-full px-4 py-2 leading-none text-sm transition font-medium bg-neutral-800 hover:bg-neutral-700"
                    onClick={discardChanges}
                >
                    {t("discard_changes")}
                </button>
                <button
                    className="rounded-full px-4 py-2 leading-none text-sm transition font-medium bg-rose-400/20 hover:bg-rose-400/30 text-rose-400"
                    onClick={saveChanges}
                >
                    {t("save_changes")}
                </button>
            </div>
        </>
    );
}

function AccountTab({ goBack }) {
    const session = useSession();

    const [user, setUser] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    const t = useTranslations("Settings");

    // Load the user
    React.useEffect(() => {
        fetch("https://api.nekosapi.com/v2/users/@me", {
            headers: {
                Accept: "application/vnd.api+json",
                Authorization: `Bearer ${session.data.accessToken}`,
            },
            cache: "no-cache"
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((json) => {
                        setUser(json);
                        setIsLoading(false);
                    });
                } else {
                    setError(true);
                    setIsLoading(false);
                }
            })
            .catch((e) => {
                setIsLoading(false);
                setError(true);
            });
    }, []);

    if (isLoading) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <CatIcon className="h-8 w-8 text-neutral-600" />
                <Loading />
            </div>
        );
    } else if (error) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <ExclamationCircleIcon className="h-8 w-8 text-rose-400" />
                <div className="text-rose-400">
                    {t("error")}
                </div>
            </div>
        );
    }

    function censoreEmail(email) {
        return `${email.substring(0, 2)}*****@${email.split("@")[1]}`
    }

    return (
        <>
            <div className="text-xl font-medium p-4 flex flex-row items-center gap-2">
                <button className="p-1.5 -my-1.5 -ml-1.5 rounded-full hover:bg-neutral-800 transition block sm:hidden" onClick={() => goBack()}>
                    <ArrowLeftIcon className="h-5 w-5 stroke-2" />
                </button>
                {t("account")}
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-4">
                <div className="text-sm flex flex-col gap-1">
                    <div className="flex flex-row items-center gap-1">
                        {t("email")}
                        <span className="text-xs text-neutral-400">
                            &#8212;
                        </span>
                        <div className="text-green-400 text-xs">
                            {t("verified")}
                        </div>
                    </div>
                    <input
                        className="w-full outline-none rounded p-2 leading-none border border-neutral-800 bg-transparent placeholder:text-neutral-400 focus:ring-1 focus:ring-rose-400 transition disabled:text-neutral-400 disabled:cursor-not-allowed"
                        placeholder={t("email")}
                        defaultValue={censoreEmail(user.data.attributes.email)}
                        disabled
                    />
                </div>
                <div className="text-sm flex flex-col gap-1">
                    {t("password")}
                    <button className="w-fit bg-neutral-800 rounded px-4 py-2 leading-none opacity-50 cursor-not-allowed">{t("change_password")}</button>
                </div>
            </div>
        </>
    );
}

function ApplicationsTab({ goBack }) {
    const t = useTranslations("Settings");

    return (
        <>
            <div className="text-xl font-medium p-4 flex flex-row items-center gap-2">
                <button className="p-1.5 -my-1.5 -ml-1.5 rounded-full hover:bg-neutral-800 transition block sm:hidden" onClick={() => goBack()}>
                    <ArrowLeftIcon className="h-5 w-5 stroke-2" />
                </button>
                {t("applications")}
            </div>
            <div className="flex-1 w-full flex flex-col items-center justify-center gap-2">
                <WrenchScrewdriverIcon className="h-8 w-8 text-neutral-600" />
                <div className="text-neutral-400 px-4 text-center">
                    {t("wip")}
                </div>
            </div>
        </>
    );
}
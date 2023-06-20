"use client";

import React from "react";

import { ArrowPathIcon, ShareIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from 'next-intl';

import { ThemeContext } from "@/contexts/ThemeContext";

import CatIcon from "@/components/CatIcon";
import Loading from "@/components/Loading";

export default function Home() {
    const { setBgGradient } = React.useContext(ThemeContext);

    const [data, setData] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(true);
    const [isImageLoading, setIsImageLoading] = React.useState(true);
    const [error, setError] = React.useState(false);

    const t = useTranslations("Home");

    const refreshImage = () => {
        setIsLoading(true);
        setIsImageLoading(true);
        setError(false);

        fetch("https://api.nekosapi.com/v2/images/random", {
            headers: {
                Accept: "application/vnd.api+json",
            },
        })
            .then((res) => res.json())
            .then((res) => {
                setData(res.data);

                if (res.data.attributes.colors.dominant) {
                    setBgGradient(res.data.attributes.colors.dominant);
                } else {
                    setBgGradient("#4c0519");
                }
            })
            .catch(setError)
            .finally(() => {
                setIsLoading(false);
            });
    };

    React.useEffect(() => {
        refreshImage();
    }, []);

    return (
        <main className="flex-1 flex flex-col items-center justify-center py-8">
            <motion.div
                className="max-w-sm min-h-[24rem] w-full rounded bg-neutral-900 flex flex-col items-center justify-center overflow-hidden"
                animate={{ height: isImageLoading ? 384 : "auto" }}
                transition={{ ease: "easeInOut", duration: 0.3 }}
            >
                <AnimatePresence>
                    {(isLoading || isImageLoading) && (
                        <div
                            className="flex flex-col items-center justify-center gap-2 absolute"
                            key={1}
                        >
                            <CatIcon className="h-8 w-8 text-neutral-600" />
                            <Loading />
                        </div>
                    )}
                    <img
                        src={!isLoading && !error ? data.attributes.file : null}
                        className="w-full max-w-sm rounded object-cover object-center bg-neutral-900 transition-all duration-300"
                        style={{
                            opacity: !isLoading && !error ? 1 : 384,
                        }}
                        onLoad={() => {
                            setIsImageLoading(false);
                        }}
                    />
                </AnimatePresence>
            </motion.div>
            <div className="mt-8 flex flex-row items-center gap-4">
                <button
                    className="flex flex-row gap-2 py-2 px-4 items-center justify-center rounded-full bg-neutral-900 hover:scale-95 transition-all"
                    onClick={refreshImage}
                >
                    <ArrowPathIcon className={`w-5 h-5 ${isLoading || isImageLoading ? "animate-spin" : ""}`} />
                    {t("refresh")}
                </button>
                <button className="flex flex-row gap-2 p-2.5 items-center justify-center rounded-full bg-neutral-900 hover:scale-90 transition-all"
                    onClick={() => {
                        navigator.clipboard.writeText(data.attributes.file);
                        alert(t("copied"));
                    }}>
                    <ShareIcon className="w-5 h-5" />
                </button>
            </div>
        </main>
    );
}

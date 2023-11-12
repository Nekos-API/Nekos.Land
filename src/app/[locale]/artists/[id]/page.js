"use client";

import React from "react";

import Link from "next/link";

import {
    EllipsisHorizontalIcon,
    GlobeAltIcon,
    InformationCircleIcon,
    Squares2X2Icon,
} from "@heroicons/react/24/outline";

import { useTranslations } from "@/messages";

import Loading from "@/components/Loading";
import CatIcon from "@/components/CatIcon";
import { getNameFromURL } from "@/utils/urls";

function getIconFromLink(link, { ...props }) {
    switch (getNameFromURL(link).toLowerCase()) {
        case "twitter":
            return (
                <img
                    src="https://cdn.nekosapi.com/svgs/logos/twitter.svg"
                    {...props}
                />
            );
        case "pixiv":
            return (
                <img
                    src="https://cdn.nekosapi.com/svgs/logos/pixiv.svg"
                    {...props}
                />
            );
        case "patreon":
            return (
                <img
                    src="https://cdn.nekosapi.com/svgs/logos/patreon.svg"
                    {...props}
                />
            );
        case "booth":
            return (
                <img
                    src="https://cdn.nekosapi.com/svgs/logos/booth.svg"
                    {...props}
                />
            );
        case "skeb":
            return (
                <img
                    src="https://cdn.nekosapi.com/svgs/logos/skeb.png"
                    {...props}
                />
            );
        default:
            return <GlobeAltIcon className="h-3 w-3 stroke-2" />;
    }
}

export default function Artist({ params }) {
    const [artist, setArtist] = React.useState();
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(false);

    const t = useTranslations("Artist");

    React.useEffect(() => {
        if (status != "loading") {
            fetch(`https://api.nekosapi.com/v3/artists/${params.id}`)
                .catch((exc) => {
                    console.error(exc);
                    setError(true);
                    setIsLoading(false);
                })
                .then((res) => {
                    if (res.status < 200 || res.status >= 300) {
                        setError(true);
                        setIsLoading(false);
                    }
                    return res.json();
                })
                .catch((exc) => {
                    console.error(exc);
                    setError(true);
                    setIsLoading(false);
                })
                .then((data) => {
                    if (!error) {
                        setArtist(data);
                        setIsLoading(false);
                    }
                });
        }
    }, [status]);

    if (isLoading) {
        return (
            <div className="w-full h-[calc(100vh-8rem)] flex flex-col items-center justify-center gap-2 text-center">
                <CatIcon className="h-8 w-8 text-neutral-600" />
                <Loading />
            </div>
        );
    }

    return (
        <main className="flex-1 flex flex-col items-center relative py-8 mx-4">
            <div className="flex flex-col w-full max-w-lg">
                <div className="flex flex-row items-center gap-4">
                    <img
                        src={artist.image_url}
                        className="h-20 w-20 rounded-full bg-neutral-900"
                    />
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="text-xl font-bold leading-none">
                            {artist.name}
                        </div>
                        <div className="flex flex-row items-center gap-4 text-sm leading-none">
                            <div className="flex flex-row items-center gap-1">
                                <div className="font-semibold">
                                    N/A
                                </div>
                                <div className="text-neutral-400">{t("images")}</div>
                            </div>
                        </div>
                        <div className="rounded bg-neutral-900 flex flex-row items-center justify-center p-1 gap-2 w-fit">
                            {artist.links.map((link, _) => {
                                return (
                                    <Link href={link} target="_blank">
                                        {getIconFromLink(link, {
                                            className: "h-3 w-3 stroke-2",
                                        })}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <button className="font-bold bg-neutral-900 p-2 rounded-full leading-none hover:scale-90 transition-all">
                            <EllipsisHorizontalIcon className="h-5 w-5 stroke-2" />
                        </button>
                    </div>
                </div>
                <div className="flex flex-row items-center justify-center w-full border-t border-t-neutral-800 mt-8 mb-6 text-sm">
                    <button className="flex flex-row items-center gap-2 px-4 py-2 leading-none border-t border-t-white -mt-px">
                        <Squares2X2Icon className="h-5 w-5 stroke-2" />
                        <span>{t("images")}</span>
                    </button>
                    <button className="flex flex-row items-center gap-2 px-4 py-2 leading-none border-t border-t-transparent -mt-px text-neutral-400 cursor-not-allowed">
                        <InformationCircleIcon className="h-5 w-5 stroke-2" />
                        <span>{t("information")}</span>
                    </button>
                </div>
                <ArtworkGrid artist={artist} />
            </div>
        </main>
    );
}

function ArtworkGrid({ artist }) {
    const [artworks, setArtworks] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(false);

    const [page, setPage] = React.useState(1);

    async function loadArtwork() {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const res = await fetch(
                `https://api.nekosapi.com/v3/images?artist=${encodeURIComponent(
                    artist.id
                )}&limit=24&offset=${
                    (page - 1) * 24
                }`,
            );

            if (res.status < 200 || res.status >= 300) {
                setError(true);
                setIsLoading(false);
                return;
            }
            const images = await res.json();

            setArtworks((v) => [...v, ...images.items]);
            setPage((v) => v + 1);
        } catch (exc) {
            console.error(exc);
            setError(true);
        }
        setIsLoading(false);
    }

    React.useEffect(() => {
        loadArtwork();
    }, []);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full relative">
                {artworks.map((v, i) => {
                    return (
                        <Artwork
                            key={i}
                            artwork={v}
                            isLast={i === artworks.length - 1}
                            loadArtwork={loadArtwork}
                        />
                    );
                })}
            </div>
            {isLoading && (
                <div className="py-4">
                    <Loading />
                </div>
            )}
        </div>
    );
}

function Artwork({ artwork, isLast, loadArtwork }) {
    const artworkRef = React.useRef();

    React.useEffect(() => {
        if (!artworkRef?.current) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (isLast && entry.isIntersecting) {
                loadArtwork();
                observer.unobserve(entry.target);
            }
        });

        observer.observe(artworkRef.current);
    }, [isLast]);

    return (
        <button
            className="w-full aspect-square rounded overflow-hidden bg-neutral-900 hover:opacity-90 transition"
            ref={artworkRef}
        >
            <img
                src={artwork.image_url}
                loading="lazy"
                className="object-cover object-center h-full w-full"
            />
        </button>
    );
}

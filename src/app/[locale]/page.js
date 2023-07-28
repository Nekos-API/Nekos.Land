"use client";

import React from "react";

import {
    ArrowPathIcon,
    ArrowsPointingOutIcon,
    BookmarkIcon as BookmarkIconOutline,
    CheckIcon,
    ChevronUpIcon,
    FlagIcon,
    HeartIcon as HeartIconOutline,
    LinkIcon,
    ShareIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import {
    BookmarkIcon as BookmarkIconSolid,
    ExclamationTriangleIcon,
    HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next-intl/client";
import Link from "next-intl/link";

import { ThemeContext } from "@/contexts/ThemeContext";

import CatIcon from "@/components/CatIcon";
import Loading from "@/components/Loading";
import { getNameFromURL } from "@/utils/urls";

/**
 * Darkens a given hex color by a specified percentage.
 *
 * @param {string} hexColor - The hex color to darken.
 * @param {number} percentage - The percentage to darken the color by (0-100).
 * @return {string} The darkened hex color.
 */
function darkenHexColor(hexColor, percentage) {
    // Remove the '#' symbol if present
    hexColor = hexColor.replace("#", "");

    // Convert the hex color to RGB
    const red = parseInt(hexColor.substring(0, 2), 16);
    const green = parseInt(hexColor.substring(2, 4), 16);
    const blue = parseInt(hexColor.substring(4, 6), 16);

    // Calculate the new darkness as a percentage (0-100)
    const darkness = 100 - percentage;

    // Calculate the scaling factor for each RGB component
    const scale = darkness / 100;

    // Darken the RGB components
    const darkenedRed = Math.floor(red * scale);
    const darkenedGreen = Math.floor(green * scale);
    const darkenedBlue = Math.floor(blue * scale);

    // Convert the darkened RGB values back to hex
    const darkenedHex = (
        (darkenedRed << 16) |
        (darkenedGreen << 8) |
        darkenedBlue
    )
        .toString(16)
        .padStart(6, "0");

    // Add the '#' symbol and return the darkened color
    return `#${darkenedHex}`;
}

const FiltersContext = React.createContext({
    ageRatingIn: [],
    setAgeRatingIn: (v) => {},
});
const ImageContext = React.createContext({
    data: {},
    setData: (v) => {},
    isLoading: false,
    setIsLoading: (v) => {},
    error: false,
    setError: (v) => {},
});
const FullScreenColorPaletteContext = React.createContext({
    isOpen: false,
    setIsOpen: (v) => {},
});

function getArtist(data) {
    if (data.included) {
        for (const i of data.included) {
            if (i.type === "artist") {
                return i;
            }
        }
    }
    return;
}

export default function Home({ searchParams }) {
    const { setBgGradient } = React.useContext(ThemeContext);
    const [ageRatingIn, setAgeRatingIn] = React.useState([
        "sfw",
        "questionable",
    ]);

    const [data, setData] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(true);
    const [isImageLoading, setIsImageLoading] = React.useState(true);
    const [error, setError] = React.useState(false);

    const [isImageLiked, setIsImageLiked] = React.useState(false);
    const [isImageSaved, setIsImageSaved] = React.useState(false);
    const [isImageReported, setIsImageReported] = React.useState(false);
    const [isArtistFollowed, setIsArtistFollowed] = React.useState(false);

    const [isFullScreenColorPaletteOpen, setIsFullScreenColorPaletteOpen] =
        React.useState(false);

    const t = useTranslations("Home");

    const { data: session } = useSession();

    React.useEffect(() => {
        if (session?.error === "RefreshAccessTokenError") {
            signIn("nekos-api"); // Force sign in to hopefully resolve error
        }
    }, [session]);

    React.useEffect(() => {
        const handleKeyDown = (event) => {
            // Check if Ctrl + R (or Cmd + R on macOS) is pressed
            if ((event.ctrlKey || event.metaKey) && event.key === "r") {
                // Prevent the default browser refresh behavior
                event.preventDefault();

                // Call the refreshImage() function when Ctrl + R is pressed
                refreshImage();
            }
        };

        // Add the event listener when the component mounts
        document.addEventListener("keydown", handleKeyDown);

        // Clean up the event listener when the component unmounts
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const refreshImage = () => {
        setIsLoading(true);
        setIsImageLoading(true);
        setIsImageReported(false);
        setError(false);

        fetch(
            `https://api.nekosapi.com/v2/images/random?filter[verificationStatus.in]=${encodeURIComponent(
                ["verified", "on_review", "not_reviewed"].join(",")
            )}&filter[ageRating.in]=${encodeURIComponent(
                ageRatingIn.join(",")
            )}`,
            {
                headers: {
                    Accept: "application/vnd.api+json",
                    Authorization: session
                        ? `Bearer ${session.accessToken}`
                        : undefined,
                },
            }
        )
            .then((res) => res.json())
            .then((res) => {
                setData(res);

                if (res.data.attributes.colors.dominant) {
                    setBgGradient(
                        darkenHexColor(res.data.attributes.colors.dominant, 70)
                    );
                } else {
                    setBgGradient("#4c0519");
                }

                setIsImageLiked(res.data.meta.user.liked);
                setIsImageSaved(res.data.meta.user.saved);

                const artist = getArtist(res);
                if (artist) {
                    setIsArtistFollowed(artist.meta.user.isFollowing);
                } else {
                    setIsArtistFollowed(false);
                }
            })
            .catch(setError)
            .finally(() => {
                setIsLoading(false);
            });
    };

    async function toggleImageLike(status) {
        setIsImageLiked(status);

        let res;

        try {
            const url = `https://api.nekosapi.com/v2/users/${session.user.id}/relationships/liked-images`;
            res = await fetch(url, {
                method: status ? "POST" : "DELETE",
                headers: {
                    "Content-Type": "application/vnd.api+json",
                    Accept: "application/vnd.api+json",
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify({
                    data: [
                        {
                            type: "image",
                            id: data.data.id,
                        },
                    ],
                }),
            });
        } catch (e) {
            console.error(e);
            setIsImageLiked(!status);
            return;
        }

        if (res.status < 200 || res.status >= 300) {
            setIsImageLiked(!status);
            console.error(res);
        }
    }

    async function toggleImageSave(status) {
        setIsImageSaved(status);

        let res;

        try {
            const url = `https://api.nekosapi.com/v2/users/${session.user.id}/relationships/saved-images`;
            res = await fetch(url, {
                method: status ? "POST" : "DELETE",
                headers: {
                    "Content-Type": "application/vnd.api+json",
                    Accept: "application/vnd.api+json",
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify({
                    data: [
                        {
                            type: "image",
                            id: data.data.id,
                        },
                    ],
                }),
            });
        } catch (e) {
            console.error(e);
            setIsImageSaved(!status);
            return;
        }

        if (res.status < 200 || res.status >= 300) {
            setIsImageSaved(!status);
            console.error(res);
        }
    }

    React.useEffect(() => {
        refreshImage();
    }, []);

    return (
        <main className="flex-1 flex flex-col relative">
            <ImageContext.Provider
                value={{
                    data,
                    setData,
                    isLoading,
                    setIsLoading,
                    error,
                    setError,
                    isImageLiked,
                    setIsImageLiked,
                    isImageSaved,
                    setIsImageSaved,
                    isImageReported,
                    setIsImageReported,
                    isArtistFollowed,
                    setIsArtistFollowed,
                }}
            >
                <FullScreenColorPaletteContext.Provider
                    value={{
                        isOpen: isFullScreenColorPaletteOpen,
                        setIsOpen: setIsFullScreenColorPaletteOpen,
                    }}
                >
                    <FiltersContext.Provider
                        value={{ ageRatingIn, setAgeRatingIn }}
                    >
                        <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 gap-8">
                            <motion.div
                                className="max-w-sm w-full rounded bg-neutral-900 flex flex-col items-center justify-center overflow-hidden"
                                animate={{
                                    height: isImageLoading ? "24rem" : "auto",
                                }}
                                style={{
                                    minHeight: isImageLoading
                                        ? "24rem"
                                        : "auto",
                                }}
                                transition={{
                                    ease: "easeInOut",
                                    duration: 0.3,
                                }}
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
                                        src={
                                            !isLoading && !error
                                                ? data.data.attributes.file
                                                : null
                                        }
                                        className="w-full max-w-sm rounded object-cover object-center bg-neutral-900 transition-all duration-300"
                                        style={{
                                            opacity:
                                                !isLoading &&
                                                !isImageLoading &&
                                                !error
                                                    ? 1
                                                    : 0,
                                        }}
                                        onLoad={() => {
                                            setIsImageLoading(false);
                                        }}
                                    />
                                </AnimatePresence>
                            </motion.div>
                            {!isLoading && !error ? (
                                <ImageDetails />
                            ) : (
                                <ImageDetailsPlaceholder />
                            )}
                            <div className="flex flex-row items-center justify-center gap-4 py-4 -my-4 w-full max-w-sm bg-black lg:sticky bottom-0">
                                {session && !isLoading && !error ? (
                                    <button
                                        className="flex flex-row gap-2 p-2.5 items-center justify-center rounded-full bg-neutral-900 hover:scale-90 transition-all"
                                        onClick={() => {
                                            toggleImageSave(!isImageSaved);
                                        }}
                                    >
                                        {isImageSaved ? (
                                            <BookmarkIconSolid className="w-5 h-5" />
                                        ) : (
                                            <BookmarkIconOutline className="w-5 h-5" />
                                        )}
                                    </button>
                                ) : (
                                    <button className="flex flex-row gap-2 p-2.5 items-center justify-center rounded-full bg-neutral-900 transition-all cursor-not-allowed opacity-70">
                                        <BookmarkIconOutline className="w-5 h-5" />
                                    </button>
                                )}
                                {session && !isLoading && !error ? (
                                    <button
                                        className="flex flex-row gap-2 p-2.5 items-center justify-center rounded-full bg-neutral-900 hover:scale-90 transition-all"
                                        onClick={() => {
                                            toggleImageLike(!isImageLiked);
                                        }}
                                    >
                                        {isImageLiked ? (
                                            <HeartIconSolid className="w-5 h-5" />
                                        ) : (
                                            <HeartIconOutline className="w-5 h-5" />
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        className="flex flex-row gap-2 p-2.5 items-center justify-center rounded-full bg-neutral-900 transition-all cursor-not-allowed opacity-70"
                                        onClick={() => {}}
                                    >
                                        <HeartIconOutline className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    className="flex flex-row gap-2 py-2 px-4 items-center justify-center rounded-full bg-neutral-900 hover:scale-95 transition-all"
                                    onClick={() => {
                                        window.scrollTo({
                                            top: 0,
                                            behavior: "smooth",
                                        });
                                        refreshImage();
                                    }}
                                >
                                    <ArrowPathIcon
                                        className={`w-5 h-5 ${
                                            isLoading || isImageLoading
                                                ? "animate-spin"
                                                : ""
                                        }`}
                                    />
                                    {t("refresh")}
                                </button>
                                <button
                                    className="flex flex-row gap-2 p-2.5 items-center justify-center rounded-full bg-neutral-900 hover:scale-90 transition-all"
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            data.data.attributes.file
                                        );
                                        alert(t("copied_image_url"));
                                    }}
                                >
                                    <ShareIcon className="w-5 h-5" />
                                </button>
                                {!isLoading && !error && !isImageReported ? (
                                    <Link href="?modal=report">
                                        <button className="flex flex-row gap-2 p-2.5 items-center justify-center rounded-full bg-neutral-900 hover:scale-90 transition-all">
                                            <FlagIcon className="w-5 h-5" />
                                        </button>
                                    </Link>
                                ) : !isImageReported ? (
                                    <button
                                        className="flex flex-row gap-2 p-2.5 items-center justify-center rounded-full bg-neutral-900 transition-all cursor-not-allowed opacity-70"
                                        onClick={() => {}}
                                    >
                                        <FlagIcon className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button
                                        className="flex flex-row gap-2 p-2.5 items-center justify-center rounded-full bg-neutral-900 transition-all cursor-not-allowed"
                                        onClick={() => {}}
                                    >
                                        <CheckIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="h-12 md:hidden"></div>
                        <FiltersPanel />
                        <FullScreenColorPalette />
                    </FiltersContext.Provider>
                </FullScreenColorPaletteContext.Provider>
            </ImageContext.Provider>
            {!isLoading && !error && (
                <ReportModal
                    searchParams={searchParams}
                    imageID={data.data.id}
                    verificationStatus={data.data.attributes.verificationStatus}
                    setIsImageReported={setIsImageReported}
                />
            )}
        </main>
    );
}

function FiltersPanel() {
    const t = useTranslations("Home");

    const [isOpen, setIsOpen] = React.useState(false);

    const { ageRatingIn, setAgeRatingIn } = React.useContext(FiltersContext);

    function AgeRatingCheckboxToggleHandler({ children, ageRating }) {
        return (
            <div
                onClick={() => {
                    if (!ageRatingIn.includes(ageRating)) {
                        setAgeRatingIn((v) => [...v, ageRating]);
                    } else if (
                        ageRatingIn.includes(ageRating) &&
                        ageRatingIn.length > 1
                    ) {
                        setAgeRatingIn((v) =>
                            v.filter((rating) => rating !== ageRating)
                        );
                    }
                }}
            >
                {children}
            </div>
        );
    }

    return (
        <div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="bg"
                        className="fixed md:hidden top-0 bottom-0 left-0 right-0 bg-black/50"
                        initial={{
                            opacity: 0,
                            backdropFilter: "blur(0px)",
                        }}
                        animate={{
                            opacity: 1,
                            backdropFilter: "blur(8px)",
                        }}
                        exit={{
                            opacity: 0,
                            backdropFilter: "blur(0px)",
                        }}
                        transition={{ duration: 0.3 }}
                        onClick={() => {
                            setIsOpen(false);
                        }}
                    ></motion.div>
                )}
            </AnimatePresence>
            <div className="fixed sm:fixed bottom-0 left-0 sm:left-auto right-0 lg:right-12 rounded-t sm:rounded-tl lg:rounded-t bg-neutral-900 sm:w-60 border border-neutral-800 lg:border-none">
                <div
                    className="flex flex-row items-center justify-between leading-none p-4 cursor-pointer shadow-xl"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="font-medium">{t("filter")}</span>
                    <ChevronUpIcon
                        className="w-5 h-5 stroke-2 transition-transform duration-300"
                        style={{
                            transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                        }}
                    />
                </div>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            className="p-4 overflow-hidden border-t border-t-neutral-800"
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.3 }}
                            key="filters"
                        >
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-semibold text-rose-400 leading-none mb-2 block">
                                    {t("age_rating")}
                                </span>
                                {[
                                    "sfw",
                                    "questionable",
                                    "suggestive",
                                    "borderline",
                                    "explicit",
                                ].map((ageRating) => (
                                    <AgeRatingCheckboxToggleHandler
                                        ageRating={ageRating}
                                    >
                                        <Checkbox
                                            isChecked={ageRatingIn.includes(
                                                ageRating
                                            )}
                                            label={t(ageRating)}
                                        />
                                    </AgeRatingCheckboxToggleHandler>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function Checkbox({ isChecked, label }) {
    return (
        <div className="flex flex-row items-center gap-2 cursor-pointer transition-opacity hover:opacity-80 select-none">
            <button
                className="border-2 border-white rounded-sm h-4 w-4 transition-color"
                style={{
                    backgroundColor: isChecked ? "white" : "transparent",
                }}
            >
                <CheckIcon
                    className="w-3 h-3 transition-colors"
                    style={{
                        color: isChecked ? "black" : "transparent",
                        strokeWidth: "4px",
                    }}
                />
            </button>
            <span className="text-sm">{label}</span>
        </div>
    );
}

function ImageDetails() {
    const t = useTranslations("Home");
    const { data, isLoading, error, isArtistFollowed, setIsArtistFollowed } =
        React.useContext(ImageContext);
    const { setIsOpen: setIsFullScreenColorPaletteOpen } = React.useContext(
        FullScreenColorPaletteContext
    );
    const { data: session } = useSession();

    const artist = getArtist(data);

    async function toggleArtistFollow(status) {
        setIsArtistFollowed(status);

        let res;

        try {
            const url = `https://api.nekosapi.com/v2/users/${session.user.id}/relationships/followed-artists`;
            res = await fetch(url, {
                method: status ? "POST" : "DELETE",
                headers: {
                    "Content-Type": "application/vnd.api+json",
                    Accept: "application/vnd.api+json",
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify({
                    data: [
                        {
                            type: "artist",
                            id: artist.id,
                        },
                    ],
                }),
            });
        } catch (e) {
            setIsArtistFollowed(!status);
            console.error(res);
            return;
        }

        if (res.status < 200 && res.status >= 300) {
            setIsArtistFollowed(!status);
            console.error(res);
        }
    }

    return (
        <div className="rounded bg-neutral-800 w-full max-w-sm overflow-hidden flex flex-col gap-px">
            {artist ? (
                <div className="p-4 bg-neutral-900">
                    <div className="flex flex-row items-center gap-2">
                        <Link
                            href={`/artists/${artist.id}`}
                            className="flex flex-row items-center gap-2 hover:text-rose-200 transition-colors"
                        >
                            <img
                                src={artist.attributes.imageUrl}
                                className="h-6 w-6 rounded-full object-cover object-center"
                            />
                            <div className="font-medium leading-none">
                                {artist.attributes.name}
                            </div>
                        </Link>
                        {session ? (
                            isArtistFollowed ? (
                                <button
                                    className="text-xs rounded-full border border-rose-400 py-0.5 px-2 leading-none transition-colors hover:bg-neutral-800"
                                    onClick={() => toggleArtistFollow(false)}
                                >
                                    {t("unfollow")}
                                </button>
                            ) : (
                                <button
                                    className="text-xs rounded-full bg-neutral-700 py-0.5 px-2 leading-none transition-colors hover:bg-neutral-800"
                                    onClick={() => toggleArtistFollow(true)}
                                >
                                    {t("follow")}
                                </button>
                            )
                        ) : (
                            <button className="text-xs rounded-full bg-neutral-700 py-0.5 px-2 leading-none transition-colors cursor-not-allowed opacity-70">
                                {t("follow")}
                            </button>
                        )}
                    </div>
                    <div className="flex flex-row gap-1 text-sm leading-none mt-4">
                        <div className="text-rose-400 font-medium">
                            {t("aliases")}:
                        </div>
                        <div className="text-neutral-300">
                            {artist.attributes.aliases.map((alias, index) => {
                                if (
                                    index !==
                                    artist.attributes.aliases.length - 1
                                ) {
                                    return (
                                        <span key={index} className="ml-1">
                                            {alias},
                                        </span>
                                    );
                                } else {
                                    return (
                                        <span key={index} className="ml-1">
                                            {alias}
                                        </span>
                                    );
                                }
                            })}
                        </div>
                    </div>
                    <div className="flex flex-row gap-1 text-sm leading-none mt-2">
                        <div className="text-rose-400 font-medium">
                            {t("links")}:
                        </div>
                        <div className="text-neutral-300 flex flex-row items-center gap-1 flex-wrap">
                            {artist.attributes.officialLinks.map(
                                (link, index) => {
                                    return (
                                        <Link
                                            className="ml-1 flex flex-row items-center gap-1 transition-colors hover:text-rose-200"
                                            href={link}
                                            target="_blank"
                                        >
                                            <LinkIcon className="h-3 w-3 stroke-2" />
                                            {getNameFromURL(link)}
                                        </Link>
                                    );
                                }
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-neutral-900 text-neutral-400 text-sm flex flex-col items-center gap-2 leading-none">
                    <XMarkIcon className="h-6 w-6 stroke-2" />
                    {t("no_artist")}
                </div>
            )}
            <div className="p-4 bg-neutral-900 flex flex-col gap-2">
                <div className="flex flex-row gap-1 text-sm leading-none">
                    <div className="text-rose-400 font-medium">
                        {t("image_source")}:
                    </div>
                    {data.data.attributes.source.url ? (
                        <div className="text-neutral-300">
                            <Link
                                className="ml-1 flex flex-row items-center gap-1 transition-colors hover:text-rose-200"
                                target="_blank"
                                href={data.data.attributes.source.url}
                            >
                                <LinkIcon className="h-3 w-3 stroke-2" />
                                {data.data.attributes.source.name || "Unknown"}
                            </Link>
                        </div>
                    ) : (
                        <div className="text-neutral-400">{t("no_source")}</div>
                    )}
                </div>
                <div className="flex flex-row gap-1 text-sm leading-none">
                    <div className="text-rose-400 font-medium">
                        {t("age_rating")}:
                    </div>
                    {data.data.attributes.ageRating ? (
                        <div className="text-neutral-300">
                            <div>{t(data.data.attributes.ageRating)}</div>
                        </div>
                    ) : (
                        <div className="text-neutral-400">
                            <div>{t("no_age_rating")}</div>
                        </div>
                    )}
                </div>
            </div>
            {data.data.attributes.colors.palette.length > 0 ? (
                <div className="p-4 bg-neutral-900 text-sm">
                    <div className="flex flex-row items-center justify-between">
                        <div className="text-rose-400 font-medium">
                            {t("color_palette")}:
                        </div>
                        <button
                            className="hidden lg:flex text-xs text-neutral-500 flex-row items-center gap-1 hover:text-neutral-300 transition-colors"
                            onClick={() =>
                                setIsFullScreenColorPaletteOpen(true)
                            }
                        >
                            <ArrowsPointingOutIcon className="h-3 w-3" />
                            {t("expand")}
                        </button>
                    </div>
                    <div className="flex flex-row items-center h-4 rounded overflow-hidden mt-2">
                        {data.data.attributes.colors.palette.map((color) => {
                            return (
                                <div
                                    className="h-4 flex-1"
                                    style={{ backgroundColor: color }}
                                ></div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-neutral-900 text-neutral-400 text-sm flex flex-col items-center gap-2 leading-none">
                    <XMarkIcon className="h-6 w-6 stroke-2" />
                    {t("no_color_palette")}
                </div>
            )}
        </div>
    );
}

function ImageDetailsPlaceholder() {
    return (
        <div className="bg-neutral-800 rounded w-full max-w-sm flex flex-col gap-px overflow-hidden">
            <div className="p-4 bg-neutral-900 flex flex-col gap-2">
                <div className="flex flex-row items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-neutral-700 animate-pulse"></div>
                    <div className="h-3 w-28 rounded bg-neutral-700 animate-pulse"></div>
                </div>
                <div className="flex flex-row items-center gap-2 mt-2">
                    <div className="h-3 w-40 rounded bg-neutral-700 animate-pulse"></div>
                    <div className="h-3 w-20 rounded bg-neutral-700 animate-pulse"></div>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <div className="h-3 w-32 rounded bg-neutral-700 animate-pulse"></div>
                    <div className="h-3 w-16 rounded bg-neutral-700 animate-pulse"></div>
                </div>
            </div>
            <div className="p-4 bg-neutral-900 flex flex-col gap-2">
                <div className="flex flex-row items-center gap-2">
                    <div className="h-3 w-32 rounded bg-neutral-700 animate-pulse"></div>
                    <div className="h-3 w-20 rounded bg-neutral-700 animate-pulse"></div>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <div className="h-3 w-36 rounded bg-neutral-700 animate-pulse"></div>
                    <div className="h-3 w-24 rounded bg-neutral-700 animate-pulse"></div>
                </div>
            </div>
            <div className="p-4 bg-neutral-900 flex flex-col gap-4">
                <div className="flex flex-row items-center justify-between">
                    <div className="h-3 w-32 rounded bg-neutral-700 animate-pulse"></div>
                    <div className="h-2 w-16 rounded bg-neutral-700 animate-pulse hidden lg:block"></div>
                </div>
                <div className="h-4 w-full rounded bg-neutral-700 animate-pulse"></div>
            </div>
        </div>
    );
}

function FullScreenColorPalette() {
    const { data } = React.useContext(ImageContext);
    const { isOpen, setIsOpen } = React.useContext(
        FullScreenColorPaletteContext
    );
    const t = useTranslations("Home");

    /**
     * Determines whether a given hex color is light or dark based on its brightness.
     *
     * @param {string} color - the hex color code to be checked for brightness.
     * @return {boolean} true if the hex color is light, false if it is dark.
     */
    function hexIsLight(color) {
        const hex = color.replace("#", "");
        const c_r = parseInt(hex.substring(0, 0 + 2), 16);
        const c_g = parseInt(hex.substring(2, 2 + 2), 16);
        const c_b = parseInt(hex.substring(4, 4 + 2), 16);
        const brightness = (c_r * 299 + c_g * 587 + c_b * 114) / 1000;
        return brightness > 155;
    }

    return (
        <AnimatePresence>
            {isOpen && data.data.attributes.colors.palette.length > 0 && (
                <div
                    className="hidden lg:block h-screen w-screen fixed top-0 bottom-0 left-0 right-0 z-50"
                    key="palette-container"
                >
                    <div className="flex flex-row items-end h-full w-full">
                        {data.data.attributes.colors.palette.map(
                            (color, index) => {
                                return (
                                    <motion.div
                                        key={index}
                                        style={{ backgroundColor: color }}
                                        className="flex-1 flex flex-col items-center justify-end overflow-hidden min-w-0 min-h-0 relative group cursor-pointer"
                                        initial={{ height: 0 }}
                                        animate={{ height: "100vh" }}
                                        exit={{ height: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: 0.075 * index,
                                        }}
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                color
                                            );
                                            alert(t("copied"));
                                        }}
                                    >
                                        <div
                                            className="opacity-40 group-hover:opacity-80 transition-opacity absolute bottom-8 left-0 right-0 mx-auto w-fit text-lg font-bold"
                                            style={{
                                                color: hexIsLight(color)
                                                    ? "black"
                                                    : "white",
                                            }}
                                        >
                                            {color.toUpperCase()}
                                        </div>
                                    </motion.div>
                                );
                            }
                        )}
                    </div>
                    <motion.button
                        className="absolute top-4 right-8 rounded-full py-2 px-4 bg-neutral-900 text-neutral-100 leading-none flex flex-row items-center gap-2 transition-transform hover:scale-95"
                        key="close-palette-button"
                        onClick={() => setIsOpen(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 0.3,
                        }}
                    >
                        <XMarkIcon className="h-5 w-5 stroke-2" />
                        {t("close")}
                    </motion.button>
                </div>
            )}
        </AnimatePresence>
    );
}

function ReportModal({
    searchParams,
    imageID,
    verificationStatus,
    setIsImageReported,
}) {
    const session = useSession();
    const t = useTranslations("Home");
    const router = useRouter();

    const reportReasonRef = React.useRef();

    const reportImage = async (e = null) => {
        if (e != null) {
            e.preventDefault();
        }

        if (session.data) {
            fetch(
                `https://api.nekosapi.com/v2/images/${imageID}/report?reason=${encodeURIComponent(
                    reportReasonRef.current.value
                )}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${session.data.accessToken}`,
                    },
                }
            )
                .then((res) => {
                    if (!res.ok) {
                        alert(t("image_report_error"));
                    }
                })
                .catch(() => {
                    alert(t("image_report_error"));
                });
        } else {
            const errorJson = JSON.stringify(
                {
                    imageID: imageID,
                    user: null,
                    error: true,
                },
                null,
                4
            );
            navigator.clipboard.writeText(
                `There is an issue with this image in Nekos.Land:\n\`\`\`js\n${errorJson}\n\`\`\`` +
                    (reportReasonRef.current.value.length > 0
                        ? `\nReason:\n> ${reportReasonRef.current.value}`
                        : "")
            );
            alert(t("copied_image_report"));
        }

        setIsImageReported(true);
        router.back();
    };

    return (
        <AnimatePresence>
            {searchParams?.modal && searchParams.modal.split(",").includes("report") && (
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
                        className="flex flex-col items-center justify-center gap-4 m-4"
                        initial={{ scale: .95 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: .95 }}
                        transition={{ duration: .15 }}
                    >
                        {verificationStatus != "verified" && (
                            <div className="w-full max-w-md bg-black rounded relative mx-4">
                                <div className="rounded w-full p-4 border border-yellow-400/50 bg-yellow-400/20 flex flex-row items-start gap-4 text-yellow-200">
                                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 shrink-0" />
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                verificationStatus ==
                                                "on_review"
                                                    ? t.raw("image_on_review")
                                                    : t.raw(
                                                          "image_not_reviewed"
                                                      ),
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}
                        <form
                            className="p-4 bg-neutral-900 rounded w-full max-w-md flex flex-col gap-4 z-10 mx-4"
                            onSubmit={reportImage}
                        >
                            <div className="font-medium text-xl">
                                {t("report_this_image")}
                            </div>
                            <p className="leading-tight text-neutral-400">
                                {t("image_report_description")}
                            </p>
                            <textarea
                                className="rounded-lg bg-neutral-950 text-sm w-full resize-y p-2 outline-none text-neutral-300 transition focus:ring-1 focus:ring-rose-400 placeholder:text-neutral-400"
                                placeholder={t("optional_image_report_reason")}
                                ref={reportReasonRef}
                                maxLength={200}
                                rows={3}
                            ></textarea>
                            <div className="w-full flex flex-row gap-4 items-center mt-1">
                                <button
                                    className="p-2 rounded-lg leading-none font-medium flex-1 transition bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                                    type="button"
                                    onClick={() => router.back()}
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    className="p-2 rounded-lg leading-none font-medium flex-1 transition bg-rose-400/10 hover:bg-rose-400/20 text-rose-400"
                                    type="submit"
                                >
                                    {t("report")}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

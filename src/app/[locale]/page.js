"use client";

import React from "react";

import {
    ArrowPathIcon,
    ArrowsPointingOutIcon,
    CheckIcon,
    ChevronUpIcon,
    FlagIcon,
    LinkIcon,
    ShareIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import {
    ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "@/messages";
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

function rgbToHex(rgb) {
    const r = rgb[0];
    const g = rgb[1];
    const b = rgb[2];

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
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

export default function Home({ searchParams }) {
    const { setBgGradient } = React.useContext(ThemeContext);
    const [ageRatingIn, setAgeRatingIn] = React.useState(["safe", "suggestive"]);
    const [isImageReported, setIsImageReported] = React.useState(false);

    const [data, setData] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(true);
    const [isImageLoading, setIsImageLoading] = React.useState(true);
    const [error, setError] = React.useState(false);

    const [isFullScreenColorPaletteOpen, setIsFullScreenColorPaletteOpen] =
        React.useState(false);

    const t = useTranslations("Home");

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

    const refreshImage = (imageID) => {
        setIsLoading(true);
        setIsImageLoading(true);
        setIsImageReported(false);
        setError(false);

        fetch(
            `https://api.nekosapi.com/v3/images/${
                imageID ? imageID : "random"
            }?${ageRatingIn
                .map((v) => "rating=" + encodeURIComponent(v))
                .join("&")}&limit=1`
        )
            .then((res) => res.json())
            .then((res) => {
                const img = res.items ? res.items[0] : res;
                setData(img);

                if (img.color_dominant) {
                    setBgGradient(
                        darkenHexColor(rgbToHex(img.color_dominant), 70)
                    );
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
        if (status != "loading") {
            refreshImage(searchParams.image);
        }
    }, [status]);

    return (
        <main className="flex-1 flex flex-col relative">
            {/* {searchParams.image && (
                <meta
                    name="og:image"
                    content={`https://api.nekosapi.com/v2/images/${searchParams.image}/file`}
                />
            )} */}
            <ImageContext.Provider
                value={{
                    data,
                    setData,
                    isLoading,
                    setIsLoading,
                    error,
                    setError,
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
                                                ? data.image_url
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
                                            "https://nekos.land" +
                                                window.location.pathname +
                                                "?image=" +
                                                data.id
                                        );
                                        alert(t("copied_image_url"));
                                    }}
                                >
                                    <ShareIcon className="w-5 h-5" />
                                </button>
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
                    imageID={data.id}
                    verificationStatus={data.verification}
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
                                    "safe",
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

    var getLocation = function (href) {
        var l = document.createElement("a");
        l.href = href;
        return l;
    };

    return (
        <div className="rounded bg-neutral-800 w-full max-w-sm overflow-hidden flex flex-col gap-px">
            {data.artist ? (
                <div className="p-4 bg-neutral-900">
                    <div className="flex flex-row items-center gap-2">
                        <Link
                            href={`/artists/${data.artist.id}`}
                            className="flex flex-row items-center gap-2 hover:text-rose-200 transition-colors"
                        >
                            <img
                                src={data.artist.image_url}
                                className="h-6 w-6 rounded-full object-cover object-center"
                            />
                            <div className="font-medium leading-none">
                                {data.artist.name}
                            </div>
                        </Link>
                    </div>
                    <div className="flex flex-row gap-1 text-sm leading-none mt-4">
                        <div className="text-rose-400 font-medium">
                            {t("aliases")}:
                        </div>
                        <div className="text-neutral-300">
                            {data.artist.aliases.map((alias, index) => {
                                if (index !== data.artist.aliases.length - 1) {
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
                            {data.artist.links.map((link, index) => {
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
                            })}
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
                    {data.source_url ? (
                        <div className="text-neutral-300">
                            <Link
                                className="ml-1 flex flex-row items-center gap-1 transition-colors hover:text-rose-200"
                                target="_blank"
                                href={data.source_url}
                            >
                                <LinkIcon className="h-3 w-3 stroke-2" />
                                {getLocation(data.source_url).hostname}
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
                    {data.rating ? (
                        <div className="text-neutral-300">
                            <div>{t(data.rating)}</div>
                        </div>
                    ) : (
                        <div className="text-neutral-400">
                            <div>{t("no_age_rating")}</div>
                        </div>
                    )}
                </div>
            </div>
            {data.color_palette.length > 0 ? (
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
                        {data.color_palette.map((color) => {
                            return (
                                <div
                                    className="h-4 flex-1"
                                    style={{ backgroundColor: rgbToHex(color) }}
                                    key={rgbToHex(color)}
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
            {isOpen && data.color_palette.length > 0 && (
                <div
                    className="hidden lg:block h-screen w-screen fixed top-0 bottom-0 left-0 right-0 z-50"
                    key="palette-container"
                >
                    <div className="flex flex-row items-end h-full w-full">
                        {data.color_palette.map(
                            (color, index) => {
                                color = rgbToHex(color);

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
    const t = useTranslations("Home");
    const router = useRouter();

    const reportReasonRef = React.useRef();

    // Must add `async` to make it work
    const reportImage = (e = null) => {
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
            {searchParams?.modal &&
                searchParams.modal.split(",").includes("report") && (
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
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            transition={{ duration: 0.15 }}
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
                                                        ? t.raw(
                                                              "image_on_review"
                                                          )
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
                                    placeholder={t(
                                        "optional_image_report_reason"
                                    )}
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

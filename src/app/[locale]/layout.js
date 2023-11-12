"use client";

import React from "react";

import { notFound } from "next/navigation";
import { Rubik } from "next/font/google";

import "./globals.css";

import ProgressBar from "next-nprogress-bar";
import { SessionProvider } from "next-auth/react";

import { ThemeContextProvider } from "@/contexts/ThemeContext";
import NavigationBar from "@/components/NavigationBar";
import BackgroundGradient from "@/components/BackgroundGradient";
import Footer from "@/components/Footer";

const rubik = Rubik({ subsets: ["latin", "latin-ext"] });

export default function RootLayout({ children, params, searchParams }) {
    if (!["en", "es"].includes(params.locale)) {
        notFound();
    }

    return (
        <html lang={params.locale}>
            <head>
                <title>
                    Nekos.Land - UwU-nique Adventures with +23.2k Anime Image
                    Meowsterpieces!
                </title>
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Nekos.Land" />
                <meta
                    property="og:title"
                    content="Nekos.Land - UwU-nique Adventures with +23.2k Anime Image Meowsterpieces!"
                />
                <meta
                    name="og:description"
                    content="Explore +23.2k adorable anime images in Nekos.Land, where charming meows and purrfection await! Join our Discord server for a meow-tastic community of anime enthusiasts. Embrace the kawaii wonders and unleash your love for anime!"
                />

                <meta
                    property="twitter:title"
                    content="Nekos.Land - UwU-nique Adventures with +23.2k Anime Image Meowsterpieces!"
                />
                <meta
                    name="twitter:description"
                    content="Explore +23.2k adorable anime images in Nekos.Land, where charming meows and purrfection await! Join our Discord server for a meow-tastic community of anime enthusiasts. Embrace the kawaii wonders and unleash your love for anime!"
                />
                <meta name="twitter:card" content="summary_large_image"></meta>

                <meta name="theme-color" content="#fb7185" />
                <meta
                    name="description"
                    content="Explore +23.2k adorable anime images in Nekos.Land, where charming meows and purrfection await! Join our Discord server for a meow-tastic community of anime enthusiasts. Embrace the kawaii wonders and unleash your love for anime!"
                />
            </head>
            <body className={rubik.className}>
                <SessionProvider>
                    <ThemeContextProvider>
                        <BackgroundGradient />
                        <NavigationBar />
                        {children}
                        <Footer />
                        <ProgressBar
                            height="2px"
                            color="#fb7185"
                            options={{ showSpinner: false }}
                            shallowRouting
                            appDirectory
                        />
                    </ThemeContextProvider>
                </SessionProvider>
            </body>
        </html>
    );
}

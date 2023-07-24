"use client";

import React from "react";

import { notFound } from "next/navigation";
import { Rubik } from "next/font/google";

import "./globals.css";

import ProgressBar from "next-nprogress-bar";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";

import { ThemeContextProvider } from "@/contexts/ThemeContext";
import NavigationBar from "@/components/NavigationBar";
import BackgroundGradient from "@/components/BackgroundGradient";
import Footer from "@/components/Footer";
import SettingsModal from "@/components/SettingsModal";

const rubik = Rubik({ subsets: ["latin", "latin-ext"] });

export function generateStaticParams() {
    return [{ locale: "en" }, { locale: "es" }];
}

export default async function RootLayout({ children, params: { locale }, searchParams }) {
    let messages;
    try {
        messages = (await import(`../../messages/${locale}.json`)).default;
    } catch (error) {
        notFound();
    }

    return (
        <html lang={locale}>
            <head>
                <title>
                    Nekos.Land - UwU-nique Adventures with +23.2k Anime Image
                    Meowsterpieces!
                </title>
                <meta property="og:type" content="website" />
                <meta
                    name="og:description"
                    content="Explore +23.2k adorable anime images in Nekos.Land, where charming meows and purrfection await! Join our Discord server for a meow-tastic community of anime enthusiasts. Embrace the kawaii wonders and unleash your love for anime!"
                />
                <meta
                    name="twitter:description"
                    content="Explore +23.2k adorable anime images in Nekos.Land, where charming meows and purrfection await! Join our Discord server for a meow-tastic community of anime enthusiasts. Embrace the kawaii wonders and unleash your love for anime!"
                />
                <meta name="theme-color" content="#fb7185" />
            </head>
            <body className={rubik.className}>
                <SessionProvider>
                    <NextIntlClientProvider locale={locale} messages={messages}>
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
                            <SettingsModal searchParams={searchParams} />
                        </ThemeContextProvider>
                    </NextIntlClientProvider>
                </SessionProvider>
            </body>
        </html>
    );
}

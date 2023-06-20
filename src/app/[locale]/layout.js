"use client";

import React from "react";

import { notFound } from "next/navigation";
import { Rubik } from "next/font/google";

import "./globals.css";

import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";

import { ThemeContextProvider } from "@/contexts/ThemeContext";
import NavigationBar from "@/components/NavigationBar";
import BackgroundGradient from "@/components/BackgroundGradient";

const rubik = Rubik({ subsets: ["latin", "latin-ext"] });

export const metadata = {
    title: "Nekos.Land - UwU-nique Adventures with +29.4k Anime Image Meowsterpieces!",
    description:
        "Explore +29.4k adorable anime images in Nekos.Land, where charming meows and purrfection await! Join our Discord server for a meow-tastic community of anime enthusiasts. Embrace the kawaii wonders and unleash your love for anime!",
};

export function generateStaticParams() {
    return [{ locale: "en" }, { locale: "es" }];
}

export default async function RootLayout({ children, params: { locale } }) {
    let messages;
    try {
        messages = (await import(`../../messages/${locale}.json`)).default;
    } catch (error) {
        notFound();
    }

    return (
        <html lang={locale}>
            <body className={rubik.className}>
                <SessionProvider>
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        <ThemeContextProvider>
                            <BackgroundGradient />
                            <NavigationBar />
                            {children}
                        </ThemeContextProvider>
                    </NextIntlClientProvider>
                </SessionProvider>
            </body>
        </html>
    );
}

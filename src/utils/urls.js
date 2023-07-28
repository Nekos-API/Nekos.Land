export function getNameFromURL(url) {
    // Get the domain name from the URL
    const domain = new URL(url).hostname;

    const names = {
        "www.twitter.com": "Twitter",
        "www.instagram.com": "Instagram",
        "www.facebook.com": "Facebook",
        "www.tiktok.com": "TikTok",
        "www.pinterest.com": "Pinterest",
        "www.pixiv.net": "Pixiv",
        "www.skeb.jp": "Skeb",
        "www.fanbox.cc": "Fanbox",
        "www.patreon.com": "Patreon",
        "www.ko-fi.com": "Ko-fi",
        "www.buymeacoffee.com": "Buymeacoffee",
        "www.twitch.tv": "Twitch",
        "www.nekos.land": "Nekos.Land",
        "www.youtube.com": "YouTube",
        "www.artstation.com": "ArtStation",
    };

    if (names[domain]) {
        return names[domain];
    } else if (names["www." + domain]) {
        return names["www." + domain];
    }

    if (domain.endsWith(".fanbox.cc")) {
        return "Fanbox";
    } else if (domain.endsWith(".booth.pm")) {
        return "BOOTH";
    }

    return domain;
}
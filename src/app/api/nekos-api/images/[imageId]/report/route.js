import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";

export async function POST(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const imageID = req.json().imageID;

    fetch(process.env.DISCORD_REPORT_IMAGES_WEBHOOK_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content: "",
            embeds: [
                {
                    title: "Nekos.Land Image Report",
                    description: JSON.parse(req.body).message,
                    color: "#ff8787",
                    author: {
                        name: session.user.username,
                        url: `https://admin.nekosapi.com/users/user/${session.user.id}/change/`,
                        iconURL:
                            session.user.avatarImage,
                    },
                    fields: [
                        {
                            name: "Image ID",
                            value: `[${imageID}](https://admin.nekosapi.com/images/image/${imageID}/change/)`,
                            inline: false,
                        },
                        {
                            name: "User ID",
                            value: `[${session.user.id}](https://admin.nekosapi.com/users/user/${session.user.id}/change/)`,
                            inline: false,
                        }
                    ],
                    timestamp: new Date().toISOString(),
                },
            ],
        }),
    }).then((resp) => {
        if (resp.ok) {
            res.status(204);
        } else {
            res.status(500);
        }
    }).catch((err) => {
        res.status(500);
        console.error(err);
    })
}

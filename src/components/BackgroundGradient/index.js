import React from "react";

import styles from "./styles.module.css";

import { ThemeContext } from "@/contexts/ThemeContext";

export default function BackgroundGradient() {
    const { bgGradient } = React.useContext(ThemeContext);

    return (
        <div className={styles.bgGradient} style={{
            "--bgGradientColor": bgGradient
        }}></div>
    )
}

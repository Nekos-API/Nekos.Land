import React from "react";

import { createContext } from "react";

export const ThemeContext = createContext({
    bgGradient: "",
    setBgGradient: () => {},
});

export const ThemeContextProvider = ({ children }) => {
    const [bgGradient, setBgGradient] = React.useState("#4c0519");

    return (
        <ThemeContext.Provider value={{ bgGradient, setBgGradient }}>
            {children}
        </ThemeContext.Provider>
    );
};

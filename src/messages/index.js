import { useParams } from "next/navigation";

import en_dict from "@/messages/en";
import es_dict from "@/messages/es";

const dictionaries = {
    en: en_dict,
    es: es_dict,
};

export const getDictionary = (locale) => {
    return dictionaries[locale] || dictionaries["en"];
};

export function useTranslations(group) {
    const params = useParams();
    return (code) => {
        return getDictionary(params.locale || "en")[group][code] || code
    };
}

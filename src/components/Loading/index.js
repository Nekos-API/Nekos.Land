import styles from "./styles.module.css";

export default function Loading() {
    return (
        <div className="w-12 h-1.5 rounded-full bg-black overflow-hidden">
            <div className={`${styles.loading} w-12 h-1.5 bg-rose-600 rounded-full`}></div>
        </div>
    );
}

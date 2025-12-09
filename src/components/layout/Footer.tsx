import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.container}`}>
                <div className={styles.left}>
                    <p className={styles.copy}>&copy; {new Date().getFullYear()} AntiGravity. All rights reserved.</p>
                </div>
                <div className={styles.right}>
                    {/* Social links or additional info */}
                    <span className={styles.text}>Made with Next.js & WordPress</span>
                </div>
            </div>
        </footer>
    );
}

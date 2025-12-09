import { Link } from '@/navigation';
import styles from './Header.module.css';

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={`container ${styles.container}`}>
                <Link href="/" className={styles.logo}>
                    AntiGravity
                </Link>
                <nav className={styles.nav}>
                    <Link href="/" className={styles.link}>Home</Link>
                    <Link href="/about" className={styles.link}>About</Link>
                    <Link href="/tools" className={styles.link}>Tools</Link>
                    <Link href="/blog" className={styles.link}>Blog</Link>
                    <Link href="/contact" className={styles.link}>Contact</Link>
                </nav>
                <div className={styles.actions}>
                    <Link href="/" locale="en" className={styles.lang}>EN</Link>
                    <Link href="/" locale="es" className={styles.lang}>ES</Link>
                </div>
            </div>
        </header>
    );
}

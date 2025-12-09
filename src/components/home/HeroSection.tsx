import { useTranslations } from 'next-intl';
import styles from './HeroSection.module.css';

export default function HeroSection() {
    const t = useTranslations('HomePage');

    return (
        <section className={styles.hero}>
            <div className={styles.glow} />
            <div className={`container ${styles.container}`}>
                <div className={styles.content}>
                    <h1 className={styles.title}>
                        Build <span className={styles.gradient}>Next-Gen</span> <br />
                        Web Experiences
                    </h1>
                    <p className={styles.subtitle}>
                        {t('description')}
                    </p>
                    <div className={styles.actions}>
                        <button className="btn">Start Building</button>
                        <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>View Tools</button>
                    </div>
                </div>
            </div>
        </section>
    );
}

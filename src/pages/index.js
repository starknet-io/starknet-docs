import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import {HomepageFeatures} from '../components/HomepageFeatures/HomepageFeatures';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <h1 className={styles.title}>{siteConfig.title}</h1>
        {siteConfig.tagline && (
          <div className="row">
            <p className="hero__subtitle">{siteConfig.tagline}</p>
          </div>
        )}
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
      wrapperClassName={styles.layout}
    >
      <div className={styles.layout}>
        <HomepageHeader />
        <main>
          <HomepageFeatures />
        </main>
      </div>
    </Layout>
  );
}

import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.frame3}>
      <div className={styles.frame22}>
        <div className={styles.frame2}>
          <div className={styles.rectangle1}>
            <div className={styles.rectangle2} />
            <div className={styles.statusBar}>
              <p className={styles.aTime}>9:41</p>
              <div className={styles.rightSide}>
                <img
                  src="../image/mn668ca1-rnzd3wy.svg"
                  className={styles.iconMobileSignal}
                />
                <img src="../image/mn668ca1-o7qghd6.svg" className={styles.wifi} />
                <img
                  src="../image/mn668ca1-28d74ju.svg"
                  className={styles.aStatusBarBattery}
                />
              </div>
            </div>
          </div>
          <div className={styles.rectangle3}>
            <img src="../image/mn668ca3-4hs293s.png" className={styles.belugeIp1} />
            <p className={styles.text}>欢迎游览长乔海洋公园</p>
            <p className={styles.text2}>登录获取更多帮助~</p>
            <div className={styles.group9}>
              <div className={styles.rectangle26}>
                <p className={styles.text3}>游客登录</p>
              </div>
              <div className={styles.rectangle27}>
                <p className={styles.text3}>伴游登录</p>
              </div>
            </div>
          </div>
          <div className={styles.frame}>
            <img
              src="../image/mn668ca1-ytqhaae.svg"
              className={styles.iConArrowChevronLeft}
            />
            <p className={styles.text4}>登录</p>
            <img
              src="../image/mn668ca1-egolnv4.svg"
              className={styles.wechatsystemDefault3}
            />
          </div>
        </div>
      </div>
      <img
        src="../image/mn668ca3-fetksod.png"
        className={styles.h6IkNqzkIq1SwwLemc1W}
      />
    </div>
  );
}

export default Component;

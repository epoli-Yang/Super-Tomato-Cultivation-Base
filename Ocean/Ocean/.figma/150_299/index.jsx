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
                  src="../image/mn668c9q-pmkkaod.svg"
                  className={styles.iconMobileSignal}
                />
                <img src="../image/mn668c9q-uwkjzxu.svg" className={styles.wifi} />
                <img
                  src="../image/mn668c9q-kenzu2u.svg"
                  className={styles.aStatusBarBattery}
                />
              </div>
            </div>
          </div>
          <div className={styles.rectangle3}>
            <img src="../image/mn668c9s-75odh0d.png" className={styles.belugeIp2} />
            <p className={styles.text}>欢迎游览长乔海洋公园</p>
            <p className={styles.text2}>请选择登录方式</p>
            <div className={styles.group9}>
              <div className={styles.rectangle26}>
                <p className={styles.text3}>获取当前微信账号</p>
              </div>
              <div className={styles.rectangle27}>
                <p className={styles.text3}>其他方式登录</p>
              </div>
              <p className={styles.text6}>
                <span className={styles.text4}>不登录了，使用</span>
                <span className={styles.text5}>游客身份</span>
                <span className={styles.text4}>浏览</span>
              </p>
            </div>
          </div>
          <div className={styles.frame}>
            <img
              src="../image/mn668c9q-66ligzc.svg"
              className={styles.iConArrowChevronLeft}
            />
            <p className={styles.text7}>登录</p>
            <img
              src="../image/mn668c9q-t2blk0p.svg"
              className={styles.wechatsystemDefault3}
            />
          </div>
        </div>
      </div>
      <img
        src="../image/mn668c9s-b479jav.png"
        className={styles.h6IkNqzkIq1SwwLemc1W}
      />
    </div>
  );
}

export default Component;
